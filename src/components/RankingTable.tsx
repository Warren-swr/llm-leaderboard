import { Group, Paper, Stack, Table, Text, Tooltip } from '@mantine/core'
import { board, fmt, isOpenModel, type RankedModel } from '../data'

interface Props {
  models: RankedModel[]
  onOpen: (id: string) => void
  custom: boolean
  showBreakdown: boolean
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
      <Group gap={16} wrap="nowrap" className="lb-score">
        <Text fw={600} className="lb-num lb-score-value">{fmt(score)}</Text>
        <div className="lb-scorebar">
          <div className="lb-scorebar__fill" style={{ width: s(score) }} />
          {hasBand && <div className="lb-scorebar__band" style={{ left: s(scoreLow), width: `calc(${s(scoreHigh)} - ${s(scoreLow)})` }} />}
        </div>
      </Group>
    </Tooltip>
  )
}

function AaDelta({ m }: { m: RankedModel }) {
  if (m.aaRank == null || m.aaIndex == null) return (
    <Tooltip label={`该模型版本不在 ${board.meta.aaRetrieved} 的 AA 名单快照中`}>
      <Text size="sm" ta="right" className="lb-muted">—</Text>
    </Tooltip>
  )
  return (
    <Tooltip label={`AA 智能指数第 ${m.aaRank} 名（${fmt(m.aaIndex)} 分，${m.aaVariant}）`}>
      <Text size="sm" ta="right" className="lb-num lb-muted">#{m.aaRank}</Text>
    </Tooltip>
  )
}

export function RankingTable({ models, onOpen, custom, showBreakdown }: Props) {
  const max = Math.max(100, ...models.map(m => m.live.scoreHigh))
  const nb = board.benchmarks.length
  return (
    <Paper className="lb-panel lb-ranking" p={0}>
      <Table.ScrollContainer minWidth={showBreakdown ? 1160 : 0} type="native">
        <Table className={`lb-table${showBreakdown ? ' is-expanded' : ''}`} highlightOnHover={false}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th className="lb-rank-cell">名次</Table.Th>
              <Table.Th className="lb-model-cell">模型</Table.Th>
              <Table.Th className="lb-score-cell">综合得分{custom ? ' · 自定义' : ''}</Table.Th>
              {showBreakdown && board.categories.map(c => (
                <Table.Th key={c.id} ta="right" className="lb-category-cell">
                  <Tooltip label={c.description}><span>{c.name}</span></Tooltip>
                </Table.Th>
              ))}
              <Table.Th className="lb-coverage-cell">实分覆盖</Table.Th>
              <Table.Th ta="right" className="lb-aa-column">AA 名次</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {models.map(m => {
              const real = Math.round(m.coverage * nb)
              const { rank, rankLow, rankHigh } = m.live
              return (
                <Table.Tr key={m.id} className="lb-row" onClick={() => onOpen(m.id)} tabIndex={0} onKeyDown={e => e.key === 'Enter' && onOpen(m.id)}>
                  <Table.Td className="lb-rank-cell">
                    <Stack gap={0}>
                      <span className="lb-rank">{rank}</span>
                      {rankLow !== rankHigh && (
                        <Tooltip label="90% 名次区间，反映补全估计带来的不确定性">
                          <Text size="xs" className="lb-faint lb-num">{rankLow}–{rankHigh}</Text>
                        </Tooltip>
                      )}
                    </Stack>
                  </Table.Td>
                  <Table.Td className="lb-model-cell">
                    <Text className="lb-model-name">{m.name}</Text>
                    <Text className="lb-model-meta">{m.vendor}<span> · {isOpenModel(m) ? '开源' : '闭源'}</span></Text>
                  </Table.Td>
                  <Table.Td className="lb-score-cell"><ScoreBar m={m} max={max} /></Table.Td>
                  {showBreakdown && board.categories.map(c => (
                    <Table.Td key={c.id} ta="right" className="lb-category-cell">
                      <Tooltip label={`${board.benchmarks.filter(b => b.category === c.id && !m.cells[b.id].imputed).length} / ${board.benchmarks.filter(b => b.category === c.id).length} 项有公开实分；类别得分含补全估计`}>
                        <Text size="sm" className="lb-num">{board.benchmarks.filter(b => b.category === c.id).every(b => m.cells[b.id].imputed) ? '≈' : ''}{fmt(m.categoryScores[c.id])}</Text>
                      </Tooltip>
                    </Table.Td>
                  ))}
                  <Table.Td className="lb-coverage-cell">
                    <Tooltip label={`${real} / ${nb} 个评测集有公开分数，覆盖当前总权重的 ${fmt(m.live.observedWeight * 100)}%；其余为补全值`}>
                      <div className="lb-coverage">
                        <Text className="lb-num lb-coverage-count">{real}/{nb}</Text>
                        <Text className="lb-num lb-coverage-weight">权重 {fmt(m.live.observedWeight * 100, 0)}%</Text>
                      </div>
                    </Tooltip>
                  </Table.Td>
                  <Table.Td className="lb-aa-column"><AaDelta m={m} /></Table.Td>
                </Table.Tr>
              )
            })}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Paper>
  )
}
