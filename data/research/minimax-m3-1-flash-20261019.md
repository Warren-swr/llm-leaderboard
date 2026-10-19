# MiniMax M3.1 Flash 正式版收录核验（2026-10-19）

检索日期：2026-10-19（Asia/Shanghai）。对象为当天正式发布的 MiniMax M3.1 Flash。本文记录公开数据更新，没有运行模型评测。

## 结果

榜单现在有 22 个模型、22 项指标。新增模型有 9/22 项可比主分数，覆盖默认总权重 39.1%；其余 60.9% 依赖补全。默认总分 52.6，名次第 8，90% 名次区间 8–12；补全值整体下调一个交叉验证误差后为第 11。区间只表示当前补全误差模型，不能覆盖所有厂商自报、题集差异及相关误差。

原有 21 个模型的 304 个实分、主来源及参考记录保持不变；22 列定义和权重不变。重新拟合会改变缺失格子的估计值及排序。科研与视觉工具推理两个类别没有 MiniMax 正式版实分，页面明确标为估计。

| 参与排名的指标 | 主分数 | 来源 |
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

## 版本与来源

- [官方英文发布页](https://www.minimax.io/blog/minimax-m31f)与[官方中文发布页](https://www.minimax.cn/blog/minimax-m31f)均标注 2026-10-19 正式更新；[完整原图与脚注](https://filecdn.minimax.chat/public/m31-flash-en-2-1792403273121.png)提供精确值和配置。
- [官方 X 补发帖](https://x.com/MiniMax_AI/status/2112150867868541221)与上述表一致；采用完整表的精确小数，未用推文中的整数概数覆盖它们。已被删除的旧帖不作为分数依据。
- 官方确认 Space Bunny 是较早版本，不能由此认定所有早期匿名结果与正式版相同。本次不移用 Space Bunny、M3 或 Preview 的成绩。
- 官方计划 10 月 23 日开放权重，截至检索日尚未公开，页面只标“闭源”。AA 名单仍为 2026-10-12 的冻结前 20，新增版本的 AA 指数、名次和 slug 留空；不借用 M3 或其他版本。

## 指标边界

### AutomationBench

62.2 放入公开集列。图表行名明确为 v1.0.6，脚注明确使用公开 600 题；正文一处的 AutomationBench-AA 称呼不覆盖这条具体方法说明。原表未另写 Pass@1，完全通过率按[作者实现](https://github.com/zapier/AutomationBench)的 `task_completed_correctly` 及同表 DeepSeek 1017=60.5 等已知公开集对照值判断，并在记录中标明推断。不能填入 Zapier 私有留出集或 AA 部分断言得分。

### Agents’ Last Exam

发布表 29.6 是完整 Overall 的完全通过率。作者[公开 API](https://agents-last-exam.org/api/demo/leaderboard)中，模型 `minimax-m3-1-flash`、`full`、`claude_code`、`reasoning-max` 的 passRate 为 45/152，与 29.6 的发布精度一致。相同配置的 avgScore × 100 为 54.9514，单独进入 Score 列。

选择 Claude Code 的依据是它对应官方 headline，不按不同 harness 的得分高低挑选。Codex 的完整集及两种 CLI 子集作为参考保留。完整集实际记录 149/152 题（Codex 147/152），CLI 为 104/105 题（Codex 102/105）；沿用作者发布的分母和值，不把缺少运行另行判断为模型零分。两列继续共享既有 ALE 家族权重。

### HLE、NL2Repo 与 GDP.pdf

HLE 43.4 是 2158 题纯文本、不用工具子集，属于非首选配置，不能称完整 2500 题。NL2Repo 61.2 使用 Claude Code 2.1.233、512K 上下文，厂商修正了两题规范与测试不一致处，并将其判定的 reward hacking case 赋零分；这些方法差异保留在出处中。

GDP.pdf 20.8 由厂商说明直接引用 AA。按[AA 作者页](https://artificialanalysis.ai/evaluations/gdp-pdf)的 headline all-pass 定义，以及同表 Kimi=22.0、GLM-5.3=11.2 与已有 AA all-pass 的吻合情况归类。当前未能独立读取 MiniMax 的 AA 模型页和该条原始记录，因此仍标“官方自报”，不伪装成此次已独立回源的 AA 模型单项。

### 其他配置

Terminal-Bench 4.0 使用 Codex 0.149.1。DeepSWE v1.1 使用 mini-SWE-agent 2.4.5、512K 上下文。OSWorld 2.0 明确采用官方推荐的 0808 Full 版本。厂商没有披露的推理档位、预算、重复次数不补写为已知。

## 未纳入现有排名列

| 官方项目 | 分数 | 原因 |
|---|---:|---|
| BankerToolBench | 76.2 | 不在现有 22 项指标内 |
| LOCA-Bench 256K | 60.3 | 不在现有指标内，不与 AA-LCR 互填 |
| PostTrain Bench v1.1 | 39.3 | 不在现有指标内，不与其他编程基准互填 |
| SWE Refactor Bench | 23.0 | 不在现有指标内，不与 FrontierSWE 互填 |
| CyberGym | 82.2 | 现有榜单尚未覆盖网络安全类别 |
| BabyVision 带工具 | 91.0 | 沿用头部饱和筛选，不加入默认排名 |
| CharXiv RQ | 82.5 | 不与 Chartography 或 ZeroBench 互填 |

这些是本次发布的其他结果，不能用相似名称填入现有列。本次维持 22 项指标和既有权重。

## 全榜变化（默认权重）

| 模型 | 更新前名次 / 总分 | 更新后名次 / 总分 |
|---|---:|---:|
| Claude Opus 5.5 | 1 / 63.6 | 1 / 63.7 |
| Claude Sonnet 5.5 | 2 / 61.6 | 2 / 61.7 |
| Claude Fable 5.1 | 3 / 60.1 | 3 / 60.3 |
| GPT-6 Astra | 4 / 59.4 | 4 / 59.6 |
| Gemini 4 Argon | 5 / 59.0 | 5 / 59.2 |
| GPT-6.1 Sol | 6 / 58.3 | 6 / 58.4 |
| DeepSeek V4.1 Flash 1017 | 7 / 55.9 | 7 / 55.8 |
| MiniMax M3.1 Flash | 未收录 | 8 / 52.6 |
| Claude Haiku 5.5 | 9 / 52.3 | 9 / 52.3 |
| MiMo-V2.6-Pro | 8 / 52.3 | 10 / 52.2 |
| Muse Spark 1.3 | 10 / 51.6 | 11 / 51.6 |
| GLM-5.3 | 11 / 50.0 | 12 / 50.0 |
| Grok 4.7 | 12 / 50.0 | 13 / 50.0 |
| Qwen3.8 Max | 13 / 49.6 | 14 / 49.6 |
| Step 5 Preview | 14 / 49.6 | 15 / 49.6 |
| Gemini 3.8 Flash | 15 / 49.1 | 16 / 49.1 |
| Ling 3.1 Flash | 16 / 48.6 | 17 / 48.6 |
| GPT-5.6 Terra | 17 / 47.8 | 18 / 47.8 |
| Kimi K3 | 18 / 47.4 | 19 / 47.4 |
| GLM-5.3-Flash | 19 / 47.3 | 20 / 47.4 |
| Qwen3.8 2.4T A95B | 20 / 46.8 | 21 / 46.8 |
| Qwen3.8-Flash-Next | 21 / 43.6 | 22 / 43.5 |

## 验证与保存

- 自动核对：原 304 个主分数、主来源和参考记录不变；总计 313 个实分、171 个补全格子；AA 对照仍只有 20 个模型；类别与指标权重未改变。
- 实分权重手算与计分模块一致：39.1%。只给科研或视觉类别权重时，MiniMax 的实分对照得分返回缺失值；只给知识工作权重时，实分对照为 GDP.pdf 的 20.8。
- 数据门禁 0 错误、5 条预期提示；交叉验证 MAE 4.93、RMSE 6.87。不同矩阵的误差不能直接作为本次更新改善泛化的证据。
- 类型检查与生产构建通过。本地生产页面已在 Chromium 中核对 22 行排名、9 个实分及出处、13 个补全格子、公开 / 私有与 Pass / Score 分列、五个标签页、20 个 AA 散点、权重重算与复位、浅深配色和 390px 手机抽屉；页面错误为 0。线上由 main 分支的 GitHub Actions 发布后独立核对同一套交互，回执与截图保存到下述证据目录。
- [来源索引](../sources/minimax/minimax-m3-1-flash-20261019.json)保留 URL、SHA256、发布分数与 ALE 原始字段。原网页、图表、删除帖回执、更新前数据快照和验证结果保存在工作区 `runs/llm-leaderboard/minimax-m31-flash-20261019-115715/`，不随公开仓库分发第三方全文。
