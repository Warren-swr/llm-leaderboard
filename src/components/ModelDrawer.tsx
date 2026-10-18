import { useEffect, useRef } from 'react'
import { Accordion, Anchor, Badge, Divider, Drawer, Group, Paper, SimpleGrid, Stack, Text } from '@mantine/core'
import { BarChart } from '@mantine/charts'
import { IconExternalLink } from '@tabler/icons-react'
import { board, categoryById, fmt, hostOf, SOURCE_LABEL, type RankedModel } from '../data'
import type { ScoreRecord } from '../types'

interface Props {
  modelId: string | null
  focusBench: string | null
  models: RankedModel[]
  onClose: () => void
}

const SOURCE_COLOR: Record<string, string> = {
  official: 'brand',
  benchmark_author: 'teal',
  third_party: 'grape',
  vendor_comparison: 'gray',
}

function ScoreEntry({ r, primary }: { r: ScoreRecord; primary?: boolean }) {
  return (
    <Stack gap={4}>
      <Group gap={8} wrap="wrap">
        <Text fw={primary ? 650 : 550} className="lb-num">{fmt(r.score)}</Text>
        <Badge size="xs" variant={primary ? 'filled' : 'light'} color={SOURCE_COLOR[r.sourceType]}>{SOURCE_LABEL[r.sourceType]}</Badge>
        <Text size="xs" className="lb-muted">{r.sourceName}</Text>
      </Group>
      <Text size="xs" className="lb-muted">配置：{r.setting}</Text>
      {r.quote && <Text className="lb-quote">“{r.quote}”</Text>}
      {r.note && <Text size="xs" className="lb-faint">{r.note}</Text>}
      <Anchor href={r.url} target="_blank" rel="noreferrer" size="xs" className="lb-link">
        <Group gap={4} wrap="nowrap"><IconExternalLink size={12} />{hostOf(r.url)}</Group>
      </Anchor>
    </Stack>
  )
}

export function ModelDrawer({ modelId, focusBench, models, onClose }: Props) {
  const m = models.find(x => x.id === modelId)
  const focusRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (focusBench) setTimeout(() => focusRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' }), 250)
  }, [focusBench, modelId])

  const chart = m
    ? board.categories.map(c => ({ category: c.id === 'vision' ? '视觉工具' : c.name, 本模型: Number(fmt(m.categoryScores[c.id])), 榜内最高: Number(fmt(Math.max(...models.map(x => x.categoryScores[c.id])))) }))
    : []

  return (
    <Drawer opened={!!m} onClose={onClose} position="right" size={620} title={m ? <Text fw={650} size="lg">{m.name}</Text> : null} padding="lg">
      {m && (
        <Stack gap="lg">
          <SimpleGrid cols={3} spacing="sm">
            <Paper className="lb-panel" p="sm">
              <Text size="xs" className="lb-muted">本榜名次</Text>
              <Text fz={24} fw={650}>#{m.live.rank}</Text>
              <Text size="xs" className="lb-faint">90% 区间 {m.live.rankLow}–{m.live.rankHigh}</Text>
            </Paper>
            <Paper className="lb-panel" p="sm">
              <Text size="xs" className="lb-muted">总分</Text>
              <Text fz={24} fw={650}>{fmt(m.live.score)}</Text>
              <Text size="xs" className="lb-faint">{fmt(m.live.scoreLow)}–{fmt(m.live.scoreHigh)}</Text>
            </Paper>
            <Paper className="lb-panel" p="sm">
              <Text size="xs" className="lb-muted">AA 智能指数</Text>
              <Text fz={24} fw={650}>{m.aaRank == null ? '—' : `#${m.aaRank}`}</Text>
              <Text size="xs" className="lb-faint">{m.aaIndex == null ? `不在 ${board.meta.aaRetrieved} 快照中` : `${fmt(m.aaIndex)} 分 · ${m.aaVariant}`}</Text>
            </Paper>
          </SimpleGrid>
          <Text size="sm" className="lb-muted">
            {m.vendor} · 发布于 {m.releaseDate} · {m.openWeights ? '开放权重' : '闭源'} · {Math.round(m.coverage * board.benchmarks.length)}/{board.benchmarks.length} 项指标有公开分数，覆盖当前总权重的 {fmt(m.live.observedWeight * 100)}%
            {m.live.pessimisticRank !== m.live.rank && `；补全值整体下调一个误差后名次变为 #${m.live.pessimisticRank}`}
          </Text>
          {m.live.observedWeight < 0.5 && <Text size="sm" c="orange">公开实分覆盖的总权重不足一半，其余为补全估计，总分与名次仅供参考。</Text>}

          <Stack gap={6}>
            <Text fw={600} size="sm">各类别得分（含补全估计）</Text>
            <Group gap={6}>
              {board.categories.map(c => {
                const benches = board.benchmarks.filter(b => b.category === c.id)
                const count = benches.filter(b => !m.cells[b.id].imputed).length
                return <Badge key={c.id} size="xs" variant="light" color={count ? 'gray' : 'orange'}>{c.name} {count}/{benches.length} 实分{count ? '' : ' · 全为估计'}</Badge>
              })}
            </Group>
            <BarChart
              h={200}
              data={chart}
              dataKey="category"
              series={[{ name: '本模型', color: 'brand.5' }, { name: '榜内最高', color: 'gray.4' }]}
              withLegend
              legendProps={{ verticalAlign: 'bottom' }}
              xAxisProps={{ interval: 0, tick: { fontSize: 10 } }}
              yAxisProps={{ domain: [0, 100], ticks: [0, 25, 50, 75, 100] }}
              gridAxis="y"
              barProps={{ radius: [4, 4, 0, 0] }}
            />
          </Stack>

          <Divider />
          <Text fw={600} size="sm">逐项分数与出处</Text>
          <Accordion multiple defaultValue={focusBench ? [focusBench] : []} variant="separated" radius="md">
            {board.categories.flatMap(c => board.benchmarks.filter(b => b.category === c.id)).map(b => {
              const cell = m.cells[b.id]
              return (
                <Accordion.Item key={b.id} value={b.id} ref={b.id === focusBench ? focusRef : undefined}>
                  <Accordion.Control>
                    <Group justify="space-between" wrap="nowrap" pr="sm">
                      <Stack gap={0}>
                        <Text size="sm" fw={550}>{b.name}</Text>
                        <Text size="xs" className="lb-faint">{categoryById[b.category].name} · {b.metric}</Text>
                      </Stack>
                      <Group gap={6} wrap="nowrap">
                        {cell.imputed ? (
                          <Badge variant="outline" color="orange" size="sm">补全 ≈{fmt(cell.value)}</Badge>
                        ) : (
                          <Text fw={650} className="lb-num">{fmt(cell.value)}</Text>
                        )}
                      </Group>
                    </Group>
                  </Accordion.Control>
                  <Accordion.Panel>
                    <Stack gap="md">
                      {cell.imputed ? (
                        <Text size="sm" className="lb-muted">
                          没有找到该模型在这个评测集上的公开分数。补全估计 {fmt(cell.value)}，90% 区间约 {fmt(Math.max(0, cell.value - 1.645 * cell.sd))}–{fmt(Math.min(100, cell.value + 1.645 * cell.sd))}。
                          该值只用于计算总分，不代表任何机构公布过这个数字。
                        </Text>
                      ) : (
                        <ScoreEntry r={cell.primary!} primary />
                      )}
                      {cell.alternates.length > 0 && (
                        <Stack gap="sm">
                          <Text size="xs" fw={600} className="lb-muted">其他配置或来源（仅供参考，不参与计算）</Text>
                          {cell.alternates.map((r, i) => (
                            <Paper key={i} p="sm" className="lb-panel"><ScoreEntry r={r} /></Paper>
                          ))}
                        </Stack>
                      )}
                    </Stack>
                  </Accordion.Panel>
                </Accordion.Item>
              )
            })}
          </Accordion>
        </Stack>
      )}
    </Drawer>
  )
}
