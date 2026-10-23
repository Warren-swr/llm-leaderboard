# 公开评测 LLM 榜单

用各家公开报告的评测分数，给 Artificial Analysis 智能指数前 20 的模型及按版本补充收录的新模型排名。厂商官方自报优先，评测集作者榜单次之，独立第三方再次之；缺失的格子用低秩矩阵补全估计，并给出误差区间。所有分数都附原始出处链接。

模型标签统一使用“开源 / 闭源”：已开放权重、或官方已明确宣布后续开放权重的模型，都归为开源；商业闭源模型归为闭源。分类针对具体模型版本。已宣布但尚未发布的权重，在模型详情保留计划日期与公告来源，不表示目前已可下载。

- 在线页面：<https://warren-swr.github.io/llm-leaderboard/>（推送到 main 后由 GitHub Actions 自动构建发布）。
- 妙搭页面：<https://bytedance.feishu.link/app/app_17gbzdsmaqd>（所有人可访问、无需登录，隐藏 GitHub 链接）。
- 当前状态：2026-10-24 收录 Kimi K3.1 Pro；现有 23 个模型、22 项排名指标、6 个能力类别。新版 Kimi 有 11/22 项实分，默认总分 61.0、第 3，90% 名次区间 2–5；原有 22 个模型的 313 个主分数及来源保持不变，旧 K3 和 AA 的 2026-10-12 名单快照保留。
- 页面入口：`npm run build` 生成 `dist/`，再用任意静态服务器打开，例如 `python3 -m http.server 18731 -d dist` 后访问 <http://127.0.0.1:18731/>。产物用相对路径构建，可以放到任意子目录；浏览器不允许从 `file://` 加载 ES module，所以不能双击打开。开发时用 `npm run dev`。
- 技术栈：TypeScript + Vite 7 + React 19 + Mantine 9（组件与图表）。

## 妙搭同步

妙搭应用为 `app_17gbzdsmaqd`，本地检出位于工作区 `exports/miaoda/llm-leaderboard/`。复用本仓库的榜单组件、生成数据和计分代码，保留妙搭的启动入口、路由和发布配置；榜单图表作为独立 workspace 安装锁定版本的依赖。

2026-10-19 发布 `7698354662982339847` 已完成，对应妙搭提交 `abb59e47af4f39b7d0a185b29a79d8bdbdcc7f80`。权限回读为 `scope=All`、`require_login=false`；未登录的新浏览器已核对 22 个模型、22 项指标、五个标签页、权重重算、模型来源、深浅配色及 390px 手机页面，页面异常为 0。榜单数据与计分代码的 SHA-256 和原站一致。

```bash
python pipeline/sync_miaoda.py ../../exports/miaoda/llm-leaderboard
cd ../../exports/miaoda/llm-leaderboard
npm install
npm run lint
npm run build
```

同步脚本只更新榜单页面、数据、首页接入和构建配置，不复制凭据或本地环境变量。`shared/leaderboard-source.json` 保留同步文件的 SHA-256。妙搭发布使用 `miaoda` 构建模式，隐藏仓库入口和指向 GitHub 的来源链接；来源名称、分数与口径说明仍保留。原站默认构建保留链接，也可用 `npm run build:miaoda` 预览隐藏链接的版本。

完成本地检查后，在妙搭检出中提交本次文件并推送 `sprint/default`，再使用 `lark-cli apps +release-create --app-id app_17gbzdsmaqd --branch sprint/default --as user` 发布，查询同次 release 到 `finished` 后检查线上页面及访问范围。以上是手动同步入口，没有创建定时任务。

## 结果概要（默认权重）

| 名次 | 模型 | 总分 | 90% 名次区间 | AA 名次 |
|---|---|---|---|---|
| 1 | Claude Opus 5.5 | 63.8 | 1–1 | 1 |
| 2 | Claude Sonnet 5.5 | 61.7 | 2–3 | 2 |
| 3 | Kimi K3.1 Pro | 61.0 | 2–5 | — |
| 4 | Claude Fable 5.1 | 60.3 | 3–6 | 3 |
| 5 | GPT-6 Astra | 59.7 | 3–7 | 4 |
| 6 | Gemini 4 Argon | 59.3 | 4–7 | 5 |
| 7 | GPT-6.1 Sol | 58.5 | 5–7 | 6 |
| 8 | DeepSeek V4.1 Flash 1017 | 55.3 | 8–9 | — |
| 9 | MiniMax M3.1 Flash | 52.7 | 8–13 | — |

Kimi K3.1 Pro 有 11/22 项公开实分，覆盖默认总权重的 55.9%；其余为补全估计，不能把第 3 名理解为全部指标的实测排序。新增模型后重新拟合补全值，其他模型的估计分数也会变化，已有实分不变。

## 2026-10-24 Kimi K3.1 Pro

采用官方发布页的结构化评测表、概览图和完整脚注，两个官方域名的 47 行表格一致。保留旧 Kimi K3，新版单独收录；AA 名次与指数留空。官方已宣布最迟 2026-11-04 发布完整权重，按本榜规则标为“开源”，详情注明尚待发布。完整依据见 [Kimi 核验记录](data/research/kimi-k3-1-pro-20261024.md)。

| 参与排名的指标 | 分数 | 关键配置 |
|---|---:|---|
| Terminal-Bench 4.0 | 65.7 | Claude Code，max |
| DeepSWE v1.1 | 75.5 | Claude Code，max |
| Terminal-Bench Science 0.1 | 38.1 | Claude Code，max |
| ProgramBench Almost@1 | 31.5 | 隐藏测试通过率达到 95% 的任务比例 |
| HLE（不用工具） | 51.1 | 完整 2500 题 |
| HLE（用工具） | 70.0 | 完整 2500 题 |
| OSWorld 2 | 79.6 | v2.1，Kimi Agent |
| GDPval-AA v2.1 | 67.3 | 官方引用 AA；Elo 1846 归一化 |
| GDP.pdf | 34.6 | 完整判分响应上的 strict all-pass，不用 Python |
| Chartography · 带工具 | 90.2 | Python，5 次平均 |
| ZeroBench-main · 带工具 | 63.0 | Python，Pass@5 |

AutomationBench-AA 73.3 是部分得分；ALE v1.1 的 43.2 / 44.2 来自 122 / 86 题，且发布表未另写 Pass / Score；GDP.pdf Python 版 85.7 是 rubric 宏平均，均只保留参考。当前 ALE 作者 API 没有新版记录，AA 同名模型页返回 404，因此 GDPval 仍标厂商引用来源，不声称已独立读取 AA 新版结果。没有采用发布表中其他模型的对照分数。

## 2026-10-19 MiniMax M3.1 Flash

采用 2026-10-19 的正式发布表与 ALE 作者 API；不移用 M3、Preview 或 Space Bunny 的成绩。官方已宣布 10 月 23 日发布权重，按本榜分类口径标“开源”，详情保留计划日期。首次收录时的核验事实与历史标注见 [MiniMax 核验记录](data/research/minimax-m3-1-flash-20261019.md)。

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
| ProgramBench Almost@1（95% 测试阈值） | 29.1 | 19/23 |
| NL2Repo-Bench Score | 68.2 | 7/23 |
| AutomationBench 公开集 Pass@1 | 60.5 | 11/23 |
| Agents' Last Exam Pass@1 | 35.4 | 14/23 |
| Chartography 带工具 | 83.0 | 7/23 |
| ZeroBench-main 带工具 Pass@5 | 51.0 | 4/23 |

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
LB_GENERATED_AT=2026-10-24 npm run data                           # 选主分数、补全、计分
npm run check:data                                                # 发布前检查（缺网址、越界、未核验等）
npm run build                                                     # 类型检查 + 构建 dist/
```

## 验证范围

- 数据门禁：0 错误、5 条预期提示（Chartography 90.2 接近饱和；ZeroBench 带工具仅 4/23；Ling 36%、DeepSeek 与 MiniMax 各 41% 的项目覆盖率低）。类型检查和生产构建通过。
- 自动对照：本次保留原 22 个模型的 313 个主分数、主来源和全部参考记录；22 列与权重保持不变，公开 / 私有、Pass / Score 家族没有翻倍加权。
- 计分检查：Kimi 的实分总权重为 55.9%；推理类别全部为实分，单独加权得分为 (51.1 + 70.0) / 2 = 60.55；没有实分的类别和缺失项继续使用现有标注规则。
- 浏览器验证范围与本次发布记录见 [Kimi 核验记录](data/research/kimi-k3-1-pro-20261024.md)，回执保留在工作区运行目录。
- 未做：没有复跑评测；没有重新逐条核查原 16 列所有模型的全部出处。补全模块初版做过合成低秩矩阵验证，本次没有据此宣称真实数据的泛化改善。

## 已知局限

- **自报偏高** ：厂商用自家 harness 自测的分数普遍高于独立复测（TB-Science 上 Anthropic 自报比 Vals AI 高 9–14 分，HLE 上比 Scale 官方榜高 14–16 分）。官方优先的规则对自报多、harness 调得好的厂商更有利。
- **覆盖不均** ：ZeroBench 带工具只有 4/23 个真实分数；NL2Repo 为 7/23，Chartography 带工具为 7/23。Kimi K3.1 Pro 有 11/22 项、覆盖权重 55.9%；DeepSeek 和 MiniMax 都有 9/22 项，分别覆盖默认权重 36.7% 与 39.1%；Ling 只有 8/22 项。
- **补全误差** ：整体交叉验证 MAE 5.2 分、RMSE 7.4 分，包含 harness、预算和版本差异。新增模型后重新拟合补全矩阵，其他模型的补全值也会变化，已收录实测分数不变。
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
