import { Tooltip } from '@mantine/core'
import { board, fmt, isOpenModel } from '../data'

export function StatTiles() {
  const imp = board.meta.imputation
  const realPct = (1 - imp.imputedCells / imp.totalCells) * 100
  const openModels = board.models.filter(isOpenModel).length
  const tiles = [
    { label: '收录模型', value: String(board.models.length), hint: `${openModels} 开源 · ${board.models.length - openModels} 闭源`, detail: '开源分类包含已宣布、尚待发布的权重，具体计划见模型详情。' },
    { label: '评测指标', value: String(board.benchmarks.length), hint: `${board.categories.length} 个能力类别`, detail: '同一家族的不同口径分列，共享家族权重。' },
    { label: '公开实分', value: `${fmt(realPct, 0)}%`, hint: `${imp.totalCells - imp.imputedCells} / ${imp.totalCells} 个格子`, detail: '其余格子使用补全估计，各模型的实分覆盖不同。' },
    { label: '补全误差', value: `${fmt(imp.cvMae, 1)}`, hint: '平均绝对误差 · 分', detail: '交叉验证平均绝对误差（百分点），不是置信区间。' },
  ]
  return (
    <dl className="lb-stats" aria-label="榜单概况">
      {tiles.map(t => (
        <Tooltip key={t.label} label={t.detail}>
          <div className="lb-stat">
            <dt>{t.label}</dt>
            <dd className="lb-num">{t.value}</dd>
            <span>{t.hint}</span>
          </div>
        </Tooltip>
      ))}
    </dl>
  )
}
