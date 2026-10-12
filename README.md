# 公开评测 LLM 榜单

用各家公开报告的评测分数，给 Artificial Analysis 智能指数前 20 的模型排名。厂商官方自报优先，评测集作者榜单次之，独立第三方再次之；缺失的格子用低秩矩阵补全估计，并给出误差区间。所有分数都附原始出处链接。

- 在线页面：<https://warren-swr.github.io/llm-leaderboard/>（推送到 main 后由 GitHub Actions 自动构建发布）。
- 当前状态：2026-10-12 完成第一版数据与页面。数据截至 2026-10-12。
- 页面入口：`npm run build` 生成 `dist/`，再用任意静态服务器打开，例如 `python3 -m http.server 18731 -d dist` 后访问 <http://127.0.0.1:18731/>。产物用相对路径构建，可以放到任意子目录；浏览器不允许从 `file://` 加载 ES module，所以不能双击打开。开发时用 `npm run dev`。
- 技术栈：TypeScript + Vite 7 + React 19 + Mantine 9（组件与图表）。

## 结果概要（默认权重）

| 名次 | 模型 | 总分 | 90% 名次区间 | AA 名次 |
|---|---|---|---|---|
| 1 | Claude Opus 5.5 | 62.2 | 1–1 | 1 |
| 2 | Claude Sonnet 5.5 | 60.4 | 2–2 | 2 |
| 3 | GPT-6 Astra | 58.4 | 3–5 | 4 |
| 4 | Claude Fable 5.1 | 58.2 | 3–5 | 3 |
| 5 | Gemini 4 Argon | 57.9 | 3–6 | 5 |
| 6 | GPT-6.1 Sol | 56.8 | 4–6 | 6 |

第 7–20 名之间分差小、区间重叠多（例如第 10–15 名的区间都跨 5 名以上），只能分成几档，不宜读成精确名次。完整结果见页面。本榜与 AA 智能指数的 Spearman 等级相关为 0.92（默认权重；页面“方法与稳健性”随权重实时计算）。

## 数据怎么来

1. **模型名单**：抓取 AA 模型榜（`data/sources/artificialanalysis/`，2026-10-12），按智能指数排序，排除已下线模型，同一模型的不同推理档位合并后取前 20。
2. **选评测集**：一个 agent 拆一个 OpenAI / Anthropic 最新发布（8 个发布页 + system card），另有两个 agent 调查其他实验室的发布会。按三条规则选出 16 个评测集、5 个类别；已饱和（头部 ≥90 分）和各家口径不可比的评测不收。依据见 `data/research/discovery-20261012.json`，选择理由写在 `data/benchmarks.json` 每一项里。
3. **收集分数**：每个模型一个收集 agent（厂商材料 + 评测作者榜单），再由另一个 agent 回源逐条核验。原始输出在 `data/research/collection-20261012.json`，合并后在 `data/scores/`。AA 自己跑的分数由脚本从快照生成，在 `data/scores-aa/`。
4. **人工复核**：自动找出主分数与其他来源相差较大的格子，逐条判定；口径有问题的写进 `data/overrides.json`，每条都有理由，页面上显示在对应格子的备注里。
5. **补全与计分**：`pipeline/build.ts` 选主分数 → `pipeline/impute.ts` 在 logit 尺度上做低秩补全（交叉验证选秩与正则，bootstrap 估误差）→ `src/scoring.ts` 加权汇总，输出 `src/data/leaderboard.json`。页面调整权重时复用同一份计分代码。

可比性规则：同一列只收“同一评测、同一指标”的分数。小版本或子集差异（HLE 纯文本子集、OSWorld 2.0 与 2.1、离线子集）算可比但不是首选；指标定义不同（ALE 的 Pass 与 Score、FrontierSWE 的 dominance 与 mean@5、GDP.pdf 的 all-pass 与 mean pass、AutomationBench 厂商自测与 Zapier 私有集）只作参考值。

## 运行

```bash
npm install
python3 pipeline/aa_records.py                                    # 由 AA 快照生成 data/scores-aa/
python3 pipeline/merge_collection.py data/research/collection-20261012.json   # 合并收集与核验结果
LB_GENERATED_AT=2026-10-12 npm run data                           # 选主分数、补全、计分
npm run check:data                                                # 发布前检查（缺网址、越界、未核验等）
npm run build                                                     # 类型检查 + 构建 dist/
```

## 验证范围

- 已做：`npm run check:data` 0 错误（1 条提示：Ling 3.1 Flash 真实覆盖 44%）；`npm run build` 通过；在浏览器中检查了五个标签页、模型详情抽屉、浅色 / 深色模式和权重滑块的实时重算。
- 核验：厂商与评测作者的记录都经回源核验；OpenAI 官网对自动访问返回 403，相关记录按收集时保存的官方页面副本核对（副本不公开，SHA256 见 `data/sources/openai/SHA256SUMS`）。另人工抽查 Kimi K3（10 项）与 Grok 4.7（6 项）的原始页面，数字全部一致。
- 补全模块用合成低秩矩阵测试过：遮掉 30% 后补全误差约 2 分，远低于填列均值的 20 分。
- 未做：没有复跑任何评测；没有逐条人工复查全部 245 个主分数。

## 已知局限

- **自报偏高**：厂商用自家 harness 自测的分数普遍高于独立复测（TB-Science 上 Anthropic 自报比 Vals AI 高 9–14 分，HLE 上比 Scale 官方榜高 14–16 分）。官方优先的规则对自报多、harness 调得好的厂商更有利。
- **覆盖不均**：FrontierCode、AutomationBench、Agents' Last Exam 各只有 7/20 个真实分数；Ling 3.1 Flash 只有 7/16 个。
- **补全误差**：整体交叉验证 MAE 4.9 分；Terminal-Bench 4.0（±11.7）和 TB-Science（±14.5）的误差最大，因为同一模型在不同 harness 下差距很大。
- **缺失非随机**：厂商往往不报自己差的评测，补全值可能偏高。页面给出“补全值下调一个误差”后的名次作对照。
- **AA 依赖**：模型名单、长上下文、知识工作和部分科研分数来自 Artificial Analysis。
- 补全值之间按独立误差抽样，区间可能偏窄。

## 目录

```
data/
  benchmarks.json        评测集、类别、默认权重与入选理由
  models.json            前 20 模型（由 AA 快照生成）
  overrides.json         人工复核的口径修正（带理由）
  scores/                厂商与评测作者记录（已核验）
  scores-aa/             AA 独立复测记录（脚本生成）
  sources/               AA 数据摘录与原始页面的 SHA256 校验值（第三方页面原件不公开，见 data/sources/README.md）
  research/              两轮 agent 调研的原始输出
pipeline/                aa_records.py、merge_collection.py、build.ts、impute.ts、check.ts
src/                     页面（components/）、计分（scoring.ts）、生成数据（data/leaderboard.json）
```

调研时下载的原始页面、PDF 与图片（1412 个文件）不随仓库公开；`data/research/` 里的 agent 输出保留了每条记录的网址与原文摘录，可以据此回源复查。
