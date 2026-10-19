"""Sync the leaderboard into an initialized Miaoda frontend project."""

import argparse
import hashlib
import json
from pathlib import Path
import subprocess


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("target", type=Path)
    args = parser.parse_args()
    source = Path(__file__).resolve().parents[1]
    target = args.target.resolve()
    meta = json.loads((target / ".spark/meta.json").read_text())
    if not str(meta.get("app_id", "")).startswith("app_"):
        parser.error("Target must be an initialized Miaoda project")
    page = target / "src/pages/Leaderboard"
    hashes = {}
    for path in sorted((source / "src").rglob("*")):
        if not path.is_file() or path.name == "main.tsx":
            continue
        relative = path.relative_to(source / "src")
        if relative == Path("data/leaderboard.json"):
            destination = target / "shared/static/data/leaderboard.json"
        elif relative == Path("App.tsx"):
            destination = page / "LeaderboardApp.tsx"
        else:
            destination = page / relative
        content = path.read_bytes()
        if relative == Path("data.ts"):
            content = content.replace(b"'./data/leaderboard.json'", b"'@shared/static/data/leaderboard.json'")
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_bytes(content)
        hashes[str(destination.relative_to(target))] = hashlib.sha256(content).hexdigest()

    (page / "Leaderboard.tsx").write_text(
        "import '@mantine/core/styles.css'\n"
        "import '@mantine/charts/styles.css'\n"
        "import './styles.css'\n\n"
        "import { MantineProvider } from '@mantine/core'\n"
        "import LeaderboardApp from './LeaderboardApp'\n"
        "import { theme } from './theme'\n\n"
        "export default function Leaderboard() {\n"
        "  return (\n"
        "    <MantineProvider theme={theme} defaultColorScheme=\"auto\">\n"
        "      <LeaderboardApp />\n"
        "    </MantineProvider>\n"
        "  )\n"
        "}\n"
    )
    package = json.loads((target / "package.json").read_text())
    original = json.loads((source / "package.json").read_text())
    lock = json.loads((source / "package-lock.json").read_text())
    dependencies = {name: lock["packages"][f"node_modules/{name}"]["version"] for name in original["dependencies"]}
    template = json.loads(subprocess.check_output(["git", "show", "HEAD:package.json"], cwd=target, text=True))
    for name in dependencies:
        if name in ("react", "react-dom"):
            package["dependencies"][name] = dependencies[name]
        elif name in template["dependencies"]:
            package["dependencies"][name] = template["dependencies"][name]
        else:
            package["dependencies"].pop(name, None)
    package["workspaces"] = sorted(set(package.get("workspaces", []) + ["src/pages/Leaderboard"]))
    workspace = {
        "name": "leaderboard-page",
        "private": True,
        "version": "0.1.0",
        "type": "module",
        "dependencies": {name: version for name, version in dependencies.items() if name not in ("react", "react-dom")},
    }
    (page / "package.json").write_text(json.dumps(workspace, indent=2) + "\n")
    (target / "package.json").write_text(json.dumps(package, indent=2) + "\n")
    app = target / "src/app.tsx"
    content = app.read_text()
    if 'import { Welcome } from "@lark-apaas/client-toolkit-lite";' in content:
        content = content.replace(
            'import { Welcome } from "@lark-apaas/client-toolkit-lite";',
            'import Leaderboard from "@/pages/Leaderboard/Leaderboard";',
        ).replace("<Welcome />", "<Leaderboard />")
        app.write_text(content)
    elif "<Leaderboard />" not in content:
        parser.error("Target homepage has changed; connect Leaderboard to its router before publishing")
    build = target / "scripts/build.sh"
    content = build.read_text().replace("npx vite build --outDir", "npx vite build --mode miaoda --outDir")
    build.write_text(content)
    config = json.loads((target / "tsconfig.app.json").read_text())
    config["compilerOptions"].update({"resolveJsonModule": True, "strict": True})
    (target / "tsconfig.app.json").write_text(json.dumps(config, indent=2) + "\n")
    index = target / "index.html"
    content = index.read_text().replace('lang="en"', 'lang="zh-CN"').replace("<title>应用标题</title>", "<title>公开评测 LLM 榜单</title>")
    index.write_text(content)
    manifest = {
        "appId": meta["app_id"],
        "sourceBaseCommit": subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=source, text=True).strip(),
        "sourceTreeSha256": hashlib.sha256(json.dumps(hashes, sort_keys=True).encode()).hexdigest(),
        "githubLinksHidden": True,
        "files": hashes,
    }
    manifest_path = target / "shared/leaderboard-source.json"
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n")
    print(f"Synced {len(hashes)} files to {target}; app {meta['app_id']}")


if __name__ == "__main__":
    main()
