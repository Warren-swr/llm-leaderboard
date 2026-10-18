import { Paper, SimpleGrid, Text } from '@mantine/core'
import { board, fmt } from '../data'

export function StatTiles() {
  const imp = board.meta.imputation
  const realPct = (1 - imp.imputedCells / imp.totalCells) * 100
  const supplements = board.models.filter(m => m.aaRank == null).length
  const tiles = [
    { label: '模型', value: String(board.models.length), hint: `AA 智能指数前 20（按模型去重）${supplements ? ` + ${supplements} 个补充模型` : ''}` },
    { label: '评测指标', value: String(board.benchmarks.length), hint: `${board.categories.length} 个能力类别，同一家族的不同口径分列` },
    { label: '真实分数占比', value: `${fmt(realPct, 0)}%`, hint: `${imp.totalCells - imp.imputedCells} / ${imp.totalCells} 个格子有公开分数` },
    { label: '补全误差', value: `±${fmt(imp.cvMae, 1)}`, hint: '交叉验证平均绝对误差（百分点）' },
  ]
  return (
    <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md">
      {tiles.map(t => (
        <Paper key={t.label} className="lb-panel" p="lg" shadow="none">
          <Text size="xs" className="lb-muted" fw={550}>{t.label}</Text>
          <Text fz={30} fw={650} mt={4} lh={1.1}>{t.value}</Text>
          <Text size="xs" className="lb-faint" mt={6}>{t.hint}</Text>
        </Paper>
      ))}
    </SimpleGrid>
  )
}
