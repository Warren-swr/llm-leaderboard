# 原始来源

这里只放管线实际用到的数据摘录和原始页面的 SHA256 校验值。第三方页面的完整副本不随仓库公开。

| 文件 | 内容 |
|---|---|
| `artificialanalysis/top20-20261012.json` | 2026-10-12 从 Artificial Analysis 模型榜整理出的前 20 名单（含各推理档位） |
| `artificialanalysis/aa-model-fields-20261012.json` | 这 20 个模型在 AA 模型页上的评测字段摘录，`pipeline/aa_records.py` 用它生成 `data/scores-aa/` |
| `artificialanalysis/SHA256SUMS` | 抓取时的 AA 页面快照与摘录文件的校验值 |
| `openai/SHA256SUMS` | 2026-10-12 保存的 OpenAI 发布页副本的校验值。openai.com 对自动访问返回 403，相关分数按这些副本核对 |
| `deepseek/deepseek-v4-1-flash-1017-20261018.json` | 1017 版官方分数摘录、配置和 2026-10-18 抓取的官方模型卡 / 更新日志 / 发布公告 SHA256；AA 名单仍保留 2026-10-12 快照 |
| `expansion/benchmark-expansion-20261018.json` | 新增 6 列的来源 URL、SHA256、逐模型记录数、原 16 列基线提交，以及 Apex / BabyVision 未纳入原因；第三方全文保存在工作区运行目录 |
| `minimax/minimax-m3-1-flash-20261019.json` | MiniMax 正式版发布表与方法脚注、ALE Pass / Score 原始字段、来源 SHA256、闭源状态及未纳入项；AA 历史快照不改写 |
| `kimi/kimi-k3-1-pro-20261024.json` | Kimi K3.1 Pro 官方 47 行成绩摘录、11 项可比指标、方法差异、权重开放计划与来源 SHA-256；旧 K3 和 AA 历史快照保留 |

抓取方式：AA 的数据内嵌在页面的 Next.js 数据里（`self.__next_f.push`），按 slug 取出对应模型的字段；名单规则见仓库 README。
