# 2026-10-18 排名评测扩展核验

检索日期：2026-10-18（Asia/Shanghai）。目标是补充与 DeepSeek 1017 公开报分对应、且能为全榜收集同指标数据的评测。原模型名单和原 16 列保留，不复跑任何模型。

## 结果

21 个模型、22 项排名指标、6 个类别。新增 6 列共补入 56 个可比主分数，原有 248 个主分数、来源和参考记录不变。新增原始记录 87 条，包括不同配置和不可比参考值；其中 14 条由 2026-10-12 已核验记录按指标重新分列，部分又在本次重看原始图片或方法说明。

DeepSeek 1017 的公开实分从 3/16 增至 9/22。默认实分权重从 20.0% 增至 36.7%；其余 63.3% 仍为补全估计。科研和知识工作没有明确属于 1017 版本的公开实分，不继承旧版成绩。

| 新增评测 | 计分口径 | DeepSeek 1017 | 全榜公开覆盖 | 默认总权重 |
|---|---|---:|---:|---:|
| ProgramBench · Almost@1 | 达到至少 95% 隐藏测试通过率的任务比例（Almost@1） | 29.1 | 18/21 | 2.05% |
| NL2Repo-Bench | Score（隐藏测试通过率，不是整仓全部通过率） | 68.2 | 6/21 | 4.09% |
| AutomationBench · 公开集 | 完全通过率（公开任务集，task_completed_correctly / Pass@1） | 60.5 | 10/21 | 2.81% |
| Agents' Last Exam · Pass@1 | 完全通过率（passRate / Pass@1，不是 avgScore） | 35.4 | 13/21 | 2.81% |
| Chartography · 带工具 | 准确率（Pass@1，专家容许范围） | 83.0 | 6/21 | 6.67% |
| ZeroBench-main · 带工具 | Pass@5（五次至少一次通过；主问题集） | 51.0 | 3/21 | 3.33% |

## 口径与来源

### ProgramBench

[作者官网](https://programbench.com/)区分整题完全通过、至少 95% 测试通过的任务比例、平均测试通过率。本次只以第二项 Almost@1 排名，并明确它不是完全实现程序的证明，类别内权重为 0.5。

[DeepSeek 系列技术报告](https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/resolve/main/DeepSeek_V41_Tech_Report.pdf)第 33 页标明 Almost@1，第 36 页说明阈值为 0.95，并披露该实验的任务范围与预算。1017 页省略指标名，但旧版 20.3 与整个对照列保持相同，因此按同系列指标收录新值 29.1；这是指标沿用判断，不是把旧版结果移到新版。1017 没有重报任务数和完整预算，不声称与 200 题完整集完全相同，记录为非首选配置。

[Vals 机器数据](https://www.vals.ai/_astro/benchmark_view_programbench.C_J7ZU4X.json)明确分开 `almost`、`strict`、`partial`。采用 `tasks.almost[model].accuracy`，该值已为百分数。模型 slug 精确映射，不用模糊前缀匹配；GLM 5.3 与 Flash、Qwen 原版与 0902 不混用。Muse Spark 1.3 优先采用[作者原榜的 max 运行](https://programbench.com/extended.html)，Vals 作为独立参考。

Anthropic 的 166 题 golden 子集平均测试通过率（如 Opus 5.5 的 91.2）保留为不可比参考；Kimi 的 77.8 同理。MiMo 自报 26.5 没有明确指标名，即使对照值提示 Almost，也仅参考，主分数采用明确标出 Almost 的 Vals 12.5。

### NL2Repo-Bench

[作者仓库](https://github.com/multimodal-art-projection/NL2RepoBench)定义 104 个从需求生成 Python 库的任务；[论文](https://proceedings.mlr.press/v306/ding26j.html)以执行测试检查功能。本列保留厂商的 Score / 隐藏测试通过率，不改称整仓完全解决率。采用 DeepSeek 1017、GLM 5.3、Qwen 三个版本的自报，以及 DeepSeek 对照表中的 Kimi K3。脚注中的 harness、预算和反作弊限制保留。

### AutomationBench 公开集

[Zapier 官方仓库](https://github.com/zapier/AutomationBench)明确区分公开 600 题和私有留出集，并区分部分断言分数与全部断言通过的 `task_completed_correctly`。本次新增公开集完全通过率列，原私有集列保留。

DeepSeek 技术报告第 32 页明确使用公开 v1.0.6，1017 新值 60.5 与原版 54.8 同行更新。GLM、Qwen、MiMo、Kimi、Ling 和 Meta 的公开记录也进入本列，版本和配置逐条保留。Meta 的[官方方法说明](https://research.meta.ai/static/muse-spark-1-3-multimodal-evaluation-methodology)第 2 页明确是 public v3、600 workflows、Pass@1，与 v1.0.6 有版本差异，记录为非首选。不能将这一列当成统一 harness、统一版本的独立复测榜。

### Agents' Last Exam 完全通过率

[作者 API](https://agents-last-exam.org/api/demo/leaderboard)提供 `passRate` 与 `avgScore`。本次新增 Pass@1 列，只用 `passRate × 100`，不把 Score 放进这列。完整 152 题优先；105 题 CLI 子集按本榜已有子集规则视为可比但非首选，具体分母、harness 和档位写在记录里。ALE 作者 API 仅标 qwen-3-8-max，无法确认 0902，因此不作为 0902 的可比主分数。记录缺少完整范围时不补写为完整集。

DeepSeek 技术报告第 32 页明确 ALE-CLI，第 33 页明确 Pass@1；1017 沿用同表对照列，收录新值 35.4。部分其他厂商原文只写评测名，Pass 口径按系列资料和已知对照值判断的情况均在备注中保留，不伪称原文明示。

### 视觉工具推理

Chartography 采用带代码 / 图片工具的准确率。Anthropic 四个模型的分数按[官方 system card](https://www-cdn.anthropic.com/870c8f525702625d2c62fc6dd04c857e3250bec1/Claude%20Sonnet%205.5%20System%20Card.pdf)核对，并优先采用统一 Gemini 3.5 Flash 裁判复测；Fable 5.1 的旧裁判配置 86.2 另作参考。Surge 作者榜上的不用工具分数不填入带工具列。Sonnet 5.5 为 90.2，保留接近饱和提示，但尚不是头部普遍超过 90%。

ZeroBench 采用 100 道主问题、带工具的 Pass@5，不混入不用工具、pass@1 或 pass^5。[作者页面](https://zerobench.github.io/)中 Qwen3.8 原版的 49.0 明确标为 reported / code-interpreter / 5 samplings，不能当作者独立复测，也不能移给 0902。本列仅 3/21 有实分，因此类别内权重 0.5，默认占总分 3.33%。

## 未纳入默认排名

| 项目 | 官方 1017 分数 | 原因 |
|---|---:|---|
| Apex Bench v1.1 | 72.1 | [1017 模型卡](https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017)没有说明任务组成、具体指标、裁判或与其他 Apex 的关系；不与 MathArena Apex 或 Mercor APEX-Agents 强行合并 |
| BabyVision 带工具 | 92.5 | 官方对照表和 Qwen 图片中的头部已有多项 90% 以上，按原有饱和筛选规则不进入默认排名 |

## 权重与可靠性

新增视觉类别占 10%，原 5 类按原比例缩放至 90%：编程 22.5%、智能体 22.5%、推理 13.5%、科研 13.5%、知识工作 18%。AutomationBench 公开 / 私有两列各 0.5，ALE Pass / Score 两列各 0.5，家族总权重不翻倍。ProgramBench Almost 与低覆盖 ZeroBench 类别内权重各为 0.5，其余新列为 1。

项目数和权重都显示：DeepSeek 有 9/22 项实分，但只覆盖 36.7% 总权重。完全没有实分的类别在总榜得分前标“≈”，抽屉显示“全为估计”。自定义权重下若无任何可用实分，实分对照得分和名次显示“—”，不转为零分。

原 16 项下的 51.7 与扩展后的 55.9 使用不同评测和权重，不能解读为模型在一天内提升了 4.2 分。默认第 7，90% 名次区间 6–7；区间只表示当前补全误差模型，不包含所有来源偏差、题集差异和相关误差。

固定当前已补全矩阵，分别将 6 个新增指标的权重归零并在类别内归一后，DeepSeek 均为第 7，点估计总分范围约 53.7–56.9。这不是移除该列后重新训练补全器的实验，也不是对未知权重、未来任务或厂商自报偏差的保证。

## 全榜前后对照（默认权重）

| 模型 | 原 16 项名次 / 总分 | 新 22 项名次 / 总分 | 新增实分项 |
|---|---:|---:|---:|
| Claude Opus 5.5 | 1 / 62.2 | 1 / 63.6 | 3/6 |
| Claude Sonnet 5.5 | 2 / 60.4 | 2 / 61.6 | 2/6 |
| Claude Fable 5.1 | 4 / 58.2 | 3 / 60.1 | 2/6 |
| GPT-6 Astra | 3 / 58.4 | 4 / 59.4 | 2/6 |
| Gemini 4 Argon | 5 / 58.0 | 5 / 59.0 | 2/6 |
| GPT-6.1 Sol | 6 / 56.8 | 6 / 58.3 | 1/6 |
| DeepSeek V4.1 Flash 1017 | 7 / 51.7 | 7 / 55.9 | 6/6 |
| MiMo-V2.6-Pro | 8 / 50.9 | 8 / 52.3 | 3/6 |
| Claude Haiku 5.5 | 9 / 50.5 | 9 / 52.3 | 2/6 |
| Muse Spark 1.3 | 10 / 49.3 | 10 / 51.6 | 3/6 |
| GLM-5.3 | 12 / 48.1 | 11 / 50.0 | 4/6 |
| Grok 4.7 | 11 / 48.1 | 12 / 50.0 | 1/6 |
| Qwen3.8 Max | 16 / 46.3 | 13 / 49.6 | 3/6 |
| Step 5 Preview | 13 / 47.7 | 14 / 49.6 | 2/6 |
| Gemini 3.8 Flash | 14 / 47.1 | 15 / 49.1 | 1/6 |
| Ling 3.1 Flash | 17 / 45.7 | 16 / 48.6 | 1/6 |
| GPT-5.6 Terra | 19 / 45.3 | 17 / 47.8 | 2/6 |
| Kimi K3 | 15 / 46.7 | 18 / 47.4 | 6/6 |
| GLM-5.3-Flash | 18 / 45.4 | 19 / 47.3 | 3/6 |
| Qwen3.8 2.4T A95B | 20 / 45.0 | 20 / 46.8 | 5/6 |
| Qwen3.8-Flash-Next | 21 / 41.9 | 21 / 43.6 | 2/6 |

## 验证与保存

- 原 248 个主分数、主来源、参考记录保持不变；本次只新增列，重新拟合缺失格子和区间。
- 新 6 列默认权重均为正；家族共享权重手算检查通过；科研单类无实分时返回缺失值，视觉单类两项实分全部覆盖时得分 72.33。
- 数据检查 0 错误、4 条预期提示；类型检查和生产构建通过。整体交叉验证 MAE 5.00、RMSE 7.09；这只是当前矩阵的拟合检验，不是新增评测导致泛化改善的证明。
- 本地生产构建已在 Chromium 中实测五个标签页、22 列矩阵、隐藏补全、点格回源、6 类权重重算与复位、无实分权重情形、AA 缺失值、浅深配色及 390px 手机抽屉。手机图表显示全部 6 类，默认权重保留一位小数；页面错误为 0。
- 本次没有复跑任何评测，也没有重新逐条核查旧 16 列的全部原始出处。线上部署由 main 分支的 GitHub Actions 完成，交付时另行核对线上同一套交互；发布回执与线上截图保存在下述工作区运行目录。
- [来源索引](../sources/expansion/benchmark-expansion-20261018.json)保留 URL、SHA256、逐模型记录数、原基线提交。第三方全文、原始图片和 PDF、原 16 项数据快照、计分检查与浏览器回执保存在工作区 `runs/llm-leaderboard/benchmark-expansion-20261018-131706/`，不随公开站点分发。
