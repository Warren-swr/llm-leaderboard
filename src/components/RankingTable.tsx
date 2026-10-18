import { Badge, Group, Paper, RingProgress, Stack, Table, Text, Tooltip } from '@mantine/core'
import { IconArrowDownRight, IconArrowUpRight, IconMinus } from '@tabler/icons-react'
import { board, fmt, type RankedModel } from '../data'

interface Props {
  models: RankedModel[]
  onOpen: (id: string) => void
  custom: boolean
}

function ScoreBar({ m, max }: { m: RankedModel; max: number }) {
  const s = (x: number) => `${(x / max) * 100}%`
  const { score, scoreLow, scoreHigh } = m.live
  const hasBand = scoreHigh - scoreLow > 0.05
  return (
    <Tooltip
      label={
        hasBand
          ? `总分 ${fmt(score)}；含补全值的 90% 区间 ${fmt(scoreLow)}–${fmt(scoreHigh)}`
          : `总分 ${fmt(score)}；全部为真实分数`
      }
    >
      <Group gap={12} wrap="nowrap">
        <Text fw={650} className="lb-num" w={44} ta="right">{fmt(score)}</Text>
        <div className="lb-scorebar" style={{ flex: 1, minWidth: 120 }}>
          <div className="lb-scorebar__fill" style={{ width: s(score) }} />
          {hasBand && <div className="lb-scorebar__band" style={{ left: s(scoreLow), width: `calc(${s(scoreHigh)} - ${s(scoreLow)})` }} />}
        </div>
      </Group>
    </Tooltip>
  )
}

function AaDelta({ m }: { m: RankedModel }) {
  if (m.aaRank == null || m.aaIndex == null) return (
    <Tooltip label={`补充收录的模型版本，不在 ${board.meta.aaRetrieved} 的 AA 名单快照中`}>
      <Text size="sm" ta="right" className="lb-muted">—</Text>
    </Tooltip>
  )
  const d = m.aaRank - m.live.rank
  const Icon = d > 0 ? IconArrowUpRight : d < 0 ? IconArrowDownRight : IconMinus
  return (
    <Tooltip label={`AA 智能指数第 ${m.aaRank} 名（${fmt(m.aaIndex)} 分，${m.aaVariant}）`}>
      <Group gap={4} wrap="nowrap" justify="flex-end">
        <Text size="sm" className="lb-num lb-muted">#{m.aaRank}</Text>
        <Icon size={14} color="var(--lb-ink-3)" aria-hidden />
      </Group>
    </Tooltip>
  )
}

export function RankingTable({ models, onOpen, custom }: Props) {
  const max = Math.max(100, ...models.map(m => m.live.scoreHigh))
  const nb = board.benchmarks.length
  return (
    <Paper className="lb-panel" p={0} style={{ overflow: 'hidden' }}>
      <Table.ScrollContainer minWidth={980}>
        <Table className="lb-table" verticalSpacing="sm" horizontalSpacing="md" highlightOnHover={false}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th w={92}>名次</Table.Th>
              <Table.Th>模型</Table.Th>
              <Table.Th w={300}>总分{custom ? '（自定义权重）' : ''}</Table.Th>
              {board.categories.map(c => (
                <Table.Th key={c.id} ta="right" w={78}>
                  <Tooltip label={c.description}><span>{c.name}</span></Tooltip>
                </Table.Th>
              ))}
              <Table.Th ta="center" w={86}>真实分数</Table.Th>
              <Table.Th ta="right" w={80}>AA 名次</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {models.map(m => {
              const real = Math.round(m.coverage * nb)
              const { rank, rankLow, rankHigh } = m.live
              return (
                <Table.Tr key={m.id} className="lb-row" onClick={() => onOpen(m.id)} tabIndex={0} onKeyDown={e => e.key === 'Enter' && onOpen(m.id)}>
                  <Table.Td>
                    <Stack gap={0}>
                      <span className="lb-rank">{rank}</span>
                      {rankLow !== rankHigh && (
                        <Tooltip label="补全值按误差随机抽样 1200 次，90% 的情况下名次落在这个范围">
                          <Text size="xs" className="lb-faint lb-num">{rankLow}–{rankHigh}</Text>
                        </Tooltip>
                      )}
                    </Stack>
                  </Table.Td>
                  <Table.Td>
                    <Group gap={8} wrap="nowrap">
                      <Stack gap={2}>
                        <Text fw={600} size="sm">{m.name}</Text>
                        <Group gap={6}>
                          <Text size="xs" className="lb-muted">{m.vendor}</Text>
                          <Text size="xs" className="lb-faint">{m.releaseDate}</Text>
                          {m.openWeights && <Badge size="xs" variant="outline" color="gray">开放权重</Badge>}
                          {m.aaRank == null && <Badge size="xs" variant="light" color="brand">补充收录</Badge>}
                        </Group>
                      </Stack>
                    </Group>
                  </Table.Td>
                  <Table.Td><ScoreBar m={m} max={max} /></Table.Td>
                  {board.categories.map(c => (
                    <Table.Td key={c.id} ta="right">
                      <Tooltip label={`${board.benchmarks.filter(b => b.category === c.id && !m.cells[b.id].imputed).length} / ${board.benchmarks.filter(b => b.category === c.id).length} 项有公开实分；类别得分含补全估计`}>
                        <Text size="sm" className="lb-num">{board.benchmarks.filter(b => b.category === c.id).every(b => m.cells[b.id].imputed) ? '≈' : ''}{fmt(m.categoryScores[c.id])}</Text>
                      </Tooltip>
                    </Table.Td>
                  ))}
                  <Table.Td>
                    <Tooltip label={`${real} / ${nb} 个评测集有公开分数，覆盖当前总权重的 ${fmt(m.live.observedWeight * 100)}%；其余为补全值`}>
                      <Group justify="center" gap={6} wrap="nowrap">
                        <RingProgress size={30} thickness={3} roundCaps sections={[{ value: m.coverage * 100, color: 'brand' }]} />
                        <Stack gap={0}>
                          <Text size="xs" className="lb-num lb-muted">{real}/{nb}</Text>
                          <Text size="xs" className="lb-num lb-faint">权重 {fmt(m.live.observedWeight * 100, 0)}%</Text>
                        </Stack>
                      </Group>
                    </Tooltip>
                  </Table.Td>
                  <Table.Td><AaDelta m={m} /></Table.Td>
                </Table.Tr>
              )
            })}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Paper>
  )
}
