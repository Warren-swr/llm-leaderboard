# 公开评测 LLM 榜单

用各家公开报告的评测分数，给 Artificial Analysis 智能指数前 20 的模型及按版本补充收录的新模型排名。厂商官方自报优先，评测集作者榜单次之，独立第三方再次之；缺失的格子用低秩矩阵补全估计，并给出误差区间。所有分数都附原始出处链接。

- 在线页面：<https://warren-swr.github.io/llm-leaderboard/>（推送到 main 后由 GitHub Actions 自动构建发布）。
- 当前状态：2026-10-19 收录 MiniMax M3.1 Flash 正式版；现有 22 个模型、22 项排名指标、6 个能力类别。MiniMax 有 9/22 项实分，原有 21 个模型的 304 个主分数及来源保持不变，AA 名单仍为 2026-10-12 快照。
- 页面入口：`npm run build` 生成 `dist/`，再用任意静态服务器打开，例如 `python3 -m http.server 18731 -d dist` 后访问 <http://127.0.0.1:18731/>。产物用相对路径构建，可以放到任意子目录；浏览器不允许从 `file://` 加载 ES module，所以不能双击打开。开发时用 `npm run dev`。
- 技术栈：TypeScript + Vite 7 + React 19 + Mantine 9（组件与图表）。

## 结果概要（默认权重）

| 名次 | 模型 | 总分 | 90% 名次区间 | AA 名次 |
|---|---|---|---|---|
| 1 | Claude Opus 5.5 | 63.7 | 1–1 | 1 |
| 2 | Claude Sonnet 5.5 | 61.7 | 2–3 | 2 |
| 3 | Claude Fable 5.1 | 60.3 | 3–5 | 3 |
| 4 | GPT-6 Astra | 59.6 | 3–6 | 4 |
| 5 | Gemini 4 Argon | 59.2 | 3–6 | 5 |
| 6 | GPT-6.1 Sol | 58.4 | 4–6 | 6 |
| 7 | DeepSeek V4.1 Flash 1017 | 55.8 | 6–7 | — |
| 8 | MiniMax M3.1 Flash | 52.6 | 8–12 | — |

MiniMax M3.1 Flash 有 9/22 项公开实分，覆盖默认总权重的 39.1%；默认 52.6 分、第 8 名，90% 名次区间 8–12。科研与视觉工具推理均为补全估计，整体排序仅供参考。

## 2026-10-19 MiniMax M3.1 Flash

采用 2026-10-19 的正式发布表与 ALE 作者 API；不移用 M3、Preview 或 Space Bunny 的成绩。当前模型权重尚未公开，统一标“闭源”。完整来源、口径和全榜变化见 [MiniMax 核验记录](data/research/minimax-m3-1-flash-20261019.md)。

| 参与排名的指标 | 分数 | 来源 |
|---|---:|---|
| Terminal-Bench 4.0 | 38.1 | 官方发布表 |
| DeepSWE v1.1 | 73.7 | 官方发布表 |
| OSWorld 2 | 61.7 | 官方发布表 |
| AutomationBench · 公开集 | 62.2 | 官方发布表 |
| Agents' Last Exam · Pass@1 | 29.6 | 官方发布表 |
| Agents' Last Exam · Score | 54.9514 | 作者榜 |
| HLE（不用工具） | 43.4 | 官方发布表 |
| NL2Repo-Bench | 61.2 | 官方发布表 |
| GDP.pdf | 20.8 | 官方发布表 |

AutomationBench 为公开 600 题集；ALE Pass 与 Score 分列，家族总权重不变；HLE 为纯文本子集。GDP.pdf 由官方发布表引用 AA，当前未独立读取 MiniMax 的 AA 模型单项，具体指标归类依据保留在备注中。

## 2026-10-18 评测扩展

从原有 16 列扩展到 22 列，新增以下参与默认排名的指标；每个指标都为其他模型补查分数，并保留来源、配置和不可比参考值。完整方法、逐模型变化和未纳入项见 [扩展核验记录](data/research/benchmark-expansion-20261018.md)。

| 新增指标 | DeepSeek 1017 实分 | 全榜有实分模型（当前） |
|---|---:|---:|
| ProgramBench Almost@1（95% 测试阈值） | 29.1 | 18/22 |
| NL2Repo-Bench Score | 68.2 | 7/22 |
| AutomationBench 公开集 Pass@1 | 60.5 | 11/22 |
| Agents' Last Exam Pass@1 | 35.4 | 14/22 |
| Chartography 带工具 | 83.0 | 6/22 |
| ZeroBench-main 带工具 Pass@5 | 51.0 | 3/22 |

新增视觉工具推理类别占 10%，原 5 类按原比例缩放到合计 90%。AutomationBench 公开 / 私有、ALE Pass / Score 共享原家族权重；ProgramBench Almost 是辅助指标，ZeroBench 带工具覆盖低，两者类别内权重均为 0.5。页面同步显示实分覆盖的总权重，完全没有实分的类别标为估计；调权重后没有任何可用实分时显示“—”，不填零分。

技术报告确认 DeepSeek 系列使用公开 AutomationBench v1.0.6 和 ALE-CLI Pass@1，因此为它们新增独立列。原来的私有集和 Score 列仍不采用这两个值。ProgramBench 的 95% 阈值任务比例、整题完全通过率、平均测试通过率分开；Chartography 和 ZeroBench 的带工具 / 不用工具也分开。Apex Bench v1.1 定义未明，BabyVision 带工具已接近饱和，本次不纳入默认排名。

首次补充 1017 版本时的 16 项结果见 [首次收录记录](data/research/deepseek-v4-1-flash-1017-20261018.md)，作为历史记录保留。新版不在 AA 冻结名单中，AA 指数与名次仍显示“—”，只比较原有 20 个模型的 AA 相关性。没有移用 9 月版或 V4 Pro 的分数。

## 数据怎么来

1. **模型名单** ：抓取 AA 模型榜（`data/sources/artificialanalysis/`，2026-10-12），按智能指数排序，排除已下线模型，同一模型的不同推理档位合并后取前 20。后续按明确版本补充模型，不改写 AA 历史快照，也不为补充模型虚构 AA 指数。
2. **选评测集** ：一个 agent 拆一个 OpenAI / Anthropic 最新发布（8 个发布页 + system card），另有两个 agent 调查其他实验室的发布会。初版按三条规则选出 16 个评测集、5 个类别；头部普遍超过 90 分或口径无法匹配的评测不收。2026-10-18 再补充 6 个有明确指标的评测列与视觉工具推理类别，逐项列出覆盖和保留条件。依据见 `data/research/discovery-20261012.json`，选择理由写在 `data/benchmarks.json` 每一项里。
3. **收集分数** ：初版每个模型一个收集 agent（厂商材料 + 评测作者榜单），再由另一个 agent 回源逐条核验。初版原始输出在 `data/research/collection-20261012.json`，合并后在 `data/scores/`。后续更新记录也放在 `data/research/`，首次收录 DeepSeek 时用新版模型卡与更新日志核对；扩展评测时另核对官方技术报告、作者榜、Vals 数据及评测图片。扩展记录在 `data/scores-expanded/`，不被初版合并脚本覆盖。AA 自己跑的分数由脚本从快照生成，在 `data/scores-aa/`；不在快照中的补充版本跳过。
4. **人工复核** ：自动找出主分数与其他来源相差较大的格子，逐条判定；口径有问题的写进 `data/overrides.json`，每条都有理由，页面上显示在对应格子的备注里。
5. **补全与计分** ：`pipeline/build.ts` 选主分数 → `pipeline/impute.ts` 在 logit 尺度上做低秩补全（交叉验证选秩与正则，bootstrap 估误差）→ `src/scoring.ts` 加权汇总，输出 `src/data/leaderboard.json`。页面调整权重时复用同一份计分代码。

可比性规则：同一列只收“同一评测、同一指标”的分数。小版本或子集差异（HLE 纯文本子集、OSWorld 2.0 与 2.1、离线子集）算可比但不是首选；指标定义不同（ALE 的 Pass 与 Score、FrontierSWE 的 dominance 与 mean@5、GDP.pdf 的 all-pass 与 mean pass、AutomationBench 公开集与 Zapier 私有集）不能互填。不同口径有对应独立列时可在各自列参与排名，在其他列只作参考值。

## 运行

```bash
npm install
python3 pipeline/aa_records.py                                    # 由 AA 快照生成 data/scores-aa/
python3 pipeline/merge_collection.py data/research/collection-20261012.json   # 合并收集与核验结果
LB_GENERATED_AT=2026-10-19 npm run data                           # 选主分数、补全、计分
npm run check:data                                                # 发布前检查（缺网址、越界、未核验等）
npm run build                                                     # 类型检查 + 构建 dist/
```

## 验证范围

- 数据门禁：0 错误、5 条预期提示（Chartography 90.2 接近饱和；ZeroBench 带工具仅 3/22；Ling 36%、DeepSeek 与 MiniMax 各 41% 的项目覆盖率低）。类型检查和生产构建通过。
- 自动对照：本次保留原 21 个模型的 304 个主分数、主来源和参考记录；22 列与权重保持不变，公开 / 私有、Pass / Score 家族没有翻倍加权。
- 计分检查：MiniMax 实分权重 39.1% 的手算对照通过；仅给科研或视觉类别权重时，其实分对照得分为缺失值；仅给知识工作类别权重时，实分对照为 GDP.pdf 的 20.8。
- 本地生产构建已实测五个标签页、抽屉、来源、权重重算、缺失值、配色和 390px 手机宽度，页面错误为 0；检查范围见本次 MiniMax 核验记录。线上发布后用同一套交互再次核对，回执保留在工作区运行目录。
- 未做：没有复跑评测；没有重新逐条核查原 16 列所有模型的全部出处。补全模块初版做过合成低秩矩阵验证，本次没有据此宣称真实数据的泛化改善。

## 已知局限

- **自报偏高** ：厂商用自家 harness 自测的分数普遍高于独立复测（TB-Science 上 Anthropic 自报比 Vals AI 高 9–14 分，HLE 上比 Scale 官方榜高 14–16 分）。官方优先的规则对自报多、harness 调得好的厂商更有利。
- **覆盖不均** ：ZeroBench 带工具只有 3/22 个真实分数；NL2Repo 为 7/22，Chartography 带工具为 6/22。DeepSeek 和 MiniMax 都有 9/22 项，分别覆盖默认权重 36.7% 与 39.1%；Ling 只有 8/22 项。
- **补全误差** ：整体交叉验证 MAE 4.9 分、RMSE 6.9 分；TB-Science（RMSE 11.3）和 Terminal-Bench 4.0（RMSE 11.5）误差较大，包含 harness、预算和版本差异。新增模型后重新拟合补全矩阵，其他模型的补全值也会变化，已收录实测分数不变。
- **缺失非随机** ：厂商往往不报自己差的评测，补全值可能偏高。页面给出“补全值下调一个误差”后的名次作对照。
- **AA 依赖** ：模型名单、长上下文、知识工作和部分科研分数来自 Artificial Analysis。
- 补全值之间按独立误差抽样，区间可能偏窄。

## 目录

```
data/
  benchmarks.json        评测集、类别、默认权重与入选理由
  models.json            AA 前 20 模型及明确版本的补充模型
  overrides.json         人工复核的口径修正（带理由）
  scores/                厂商与评测作者记录（已核验）
  scores-aa/             AA 独立复测记录（脚本生成）
  scores-expanded/       新增 6 列的记录与不可比参考值
  sources/               AA 数据摘录与原始页面的 SHA256 校验值（第三方页面原件不公开，见 data/sources/README.md）
  research/              初版调研原始输出与后续核验报告
pipeline/                aa_records.py、merge_collection.py、build.ts、impute.ts、check.ts
src/                     页面（components/）、计分（scoring.ts）、生成数据（data/leaderboard.json）
```

初版调研时下载的原始页面、PDF 与图片（1412 个文件）不随仓库公开；`data/research/` 里的 agent 输出保留了每条记录的网址与原文摘录，可以据此回源复查。
