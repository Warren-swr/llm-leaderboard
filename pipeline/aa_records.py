"""从 Artificial Analysis 快照生成第三方 / 评测集作者记录，写入 data/scores-aa/<model>.json。

用法：python3 pipeline/aa_records.py
输入：data/models.json、data/sources/artificialanalysis/aa-model-fields-20261012.json
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
models = json.loads((ROOT / 'data/models.json').read_text())['models']
fields = json.loads((ROOT / 'data/sources/artificialanalysis/aa-model-fields-20261012.json').read_text())

# 字段 → (评测集 id, 来源类型, 是否可比, 是否匹配首选配置, 配置说明)
MAP = [
    ('terminalBench40', 'terminal-bench-4', 'third_party', True, False,
     'Artificial Analysis 独立运行：mini-swe-agent harness，66 题，3 次平均，最多 500 步、无上下文压缩'),
    ('terminalBenchScience', 'terminal-bench-science', 'third_party', True, False,
     'Artificial Analysis 独立运行：70 题，3 次平均，pass@1'),
    ('hle', 'hle-no-tools', 'third_party', True, False,
     'Artificial Analysis 独立运行：纯文本子集 2,158 题，不用工具，pass@1'),
    ('scicode', 'scicode', 'third_party', True, True,
     'Artificial Analysis 独立运行：288 个子问题，带背景信息，3 次平均'),
    ('critpt', 'critpt', 'third_party', True, True,
     'Artificial Analysis 独立运行：70 道挑战题，5 次平均，官方判分服务器'),
    ('gdpvalNormalized', 'gdpval-aa', 'benchmark_author', True, True,
     'Artificial Analysis 运行（评测作者）：Stirrup harness，220 题；当前 Elo 按 clamp((Elo−500)/2000) 归一'),
    ('gdpPdfAllPass', 'gdp-pdf', 'third_party', True, True,
     'Artificial Analysis 运行：100 题 × 5 次，all-pass 指标'),
    ('lcr', 'aa-lcr', 'benchmark_author', True, True,
     'Artificial Analysis 运行（评测作者）：v1.1，100 题 × 3 次'),
    ('automationBenchPartialScore', 'automationbench', 'third_party', False, False,
     'Artificial Analysis 的 AutomationBench-AA：657 题、50 轮上限、部分得分，与 Zapier 通过率口径不同'),
]

out_dir = ROOT / 'data/scores-aa'
out_dir.mkdir(parents=True, exist_ok=True)
for m in models:
    f = fields.get(m['aaSlug'], {})
    url = f"https://artificialanalysis.ai/models/{m['aaSlug']}"
    records = []
    for key, bench, stype, comparable, matches, setting in MAP:
        v = f.get(key)
        if v is None:
            continue
        rec = {
            'benchmark': bench,
            'score': round(v * 100, 2),
            'setting': f"{setting}；档位：{m['aaVariant']}",
            'sourceType': stype,
            'sourceName': 'Artificial Analysis',
            'url': url,
            'note': f'2026-10-12 抓取的模型页数据（字段 {key}）',
            'comparable': comparable,
            'matchesPreferred': matches,
        }
        if key == 'gdpvalNormalized' and f.get('gdpval'):
            rec['quote'] = f"Elo {f['gdpval']:.0f}"
        records.append(rec)
    (out_dir / f"{m['id']}.json").write_text(json.dumps({'model': m['id'], 'records': records}, ensure_ascii=False, indent=1))
    print(m['id'], len(records))
