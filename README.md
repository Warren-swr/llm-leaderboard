# 公开评测 LLM 榜单

用各家公开报告的评测分数，给 Artificial Analysis 智能指数前 20 的模型及按版本补充收录的新模型排名。厂商官方自报优先，评测集作者榜单次之，独立第三方再次之；缺失的格子用低秩矩阵补全估计，并给出误差区间。所有分数都附原始出处链接。

- 在线页面：<https://warren-swr.github.io/llm-leaderboard/>（推送到 main 后由 GitHub Actions 自动构建发布）。
- 当前状态：2026-10-18 扩展至 21 个模型、22 项排名评测、6 个能力类别。新增 6 列共补入 56 个可比主分数，DeepSeek 1017 的实分由 3/16 增至 9/22。原 16 列的 248 个主分数与出处保持不变，AA 名单仍为 2026-10-12 快照。
- 页面入口：`npm run build` 生成 `dist/`，再用任意静态服务器打开，例如 `python3 -m http.server 18731 -d dist` 后访问 <http://127.0.0.1:18731/>。产物用相对路径构建，可以放到任意子目录；浏览器不允许从 `file://` 加载 ES module，所以不能双击打开。开发时用 `npm run dev`。
- 技术栈：TypeScript + Vite 7 + React 19 + Mantine 9（组件与图表）。

## 结果概要（默认权重）

| 名次 | 模型 | 总分 | 90% 名次区间 | AA 名次 |
|---|---|---|---|---|
| 1 | Claude Opus 5.5 | 63.6 | 1–1 | 1 |
| 2 | Claude Sonnet 5.5 | 61.6 | 2–3 | 2 |
| 3 | Claude Fable 5.1 | 60.1 | 3–5 | 3 |
| 4 | GPT-6 Astra | 59.4 | 3–6 | 4 |
| 5 | Gemini 4 Argon | 59.0 | 3–6 | 5 |
| 6 | GPT-6.1 Sol | 58.3 | 4–7 | 6 |
| 7 | DeepSeek V4.1 Flash 1017 | 55.9 | 6–7 | — |

DeepSeek 1017 有 9/22 项可比公开分数，覆盖默认总权重的 36.7%；科研和知识工作仍全部为补全估计。其默认总分 55.9、第 7 名仅供参考，90% 名次区间 6–7。固定补全矩阵、逐项移除任一新增评测后仍为第 7；这不是移除数据后重新训练的检验。完整结果与各列覆盖见页面。

## 2026-10-18 评测扩展

从原有 16 列扩展到 22 列，新增以下参与默认排名的指标；每个指标都为其他模型补查分数，并保留来源、配置和不可比参考值。完整方法、逐模型变化和未纳入项见 [扩展核验记录](data/research/benchmark-expansion-20261018.md)。

| 新增指标 | DeepSeek 1017 实分 | 全榜有实分模型 |
|---|---:|---:|
| ProgramBench Almost@1（95% 测试阈值） | 29.1 | 18/21 |
| NL2Repo-Bench Score | 68.2 | 6/21 |
| AutomationBench 公开集 Pass@1 | 60.5 | 10/21 |
| Agents' Last Exam Pass@1 | 35.4 | 13/21 |
| Chartography 带工具 | 83.0 | 6/21 |
| ZeroBench-main 带工具 Pass@5 | 51.0 | 3/21 |

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
LB_GENERATED_AT=2026-10-18 npm run data                           # 选主分数、补全、计分
npm run check:data                                                # 发布前检查（缺网址、越界、未核验等）
npm run build                                                     # 类型检查 + 构建 dist/
```

## 验证范围

- 数据门禁：0 错误、4 条预期提示（Chartography 90.2 接近饱和；ZeroBench 带工具仅 3/21；Ling 36% 与 DeepSeek 41% 的项目覆盖率低）。类型检查和生产构建通过。
- 自动对照：原 16 列的 248 个主分数、主来源、参考记录保持不变；新 6 列在默认权重下全部参与计算；公开 / 私有、Pass / Score 家族没有翻倍加权。
- 计分检查：实分权重手算对照通过；仅给科研类别权重时，DeepSeek 的实分对照得分为缺失值；仅给视觉类别权重时，两项实分完整覆盖，得分为 72.33。
- 本地生产构建已实测五个标签页、抽屉、来源、权重重算、缺失值、配色和 390px 手机宽度，页面错误为 0；检查范围见扩展核验记录。线上发布后用同一套交互再次核对，回执保留在工作区运行目录。
- 未做：没有复跑评测；没有重新逐条核查原 16 列所有模型的全部出处。补全模块初版做过合成低秩矩阵验证，本次没有据此宣称真实数据的泛化改善。

## 已知局限

- **自报偏高** ：厂商用自家 harness 自测的分数普遍高于独立复测（TB-Science 上 Anthropic 自报比 Vals AI 高 9–14 分，HLE 上比 Scale 官方榜高 14–16 分）。官方优先的规则对自报多、harness 调得好的厂商更有利。
- **覆盖不均** ：ZeroBench 带工具只有 3/21 个真实分数；NL2Repo 和 Chartography 带工具各 6/21。DeepSeek 1017 只有 9/22 项，覆盖权重 36.7%；Ling 只有 8/22 项。
- **补全误差** ：整体交叉验证 MAE 5.0 分、RMSE 7.1 分；TB-Science（RMSE 12.4）和 Terminal-Bench 4.0（RMSE 11.9）误差较大，包含 harness、预算和版本差异。新增模型后重新拟合补全矩阵，其他模型的补全值也会变化，已收录实测分数不变。
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
