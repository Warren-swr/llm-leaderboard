import { useMemo, useState } from 'react'
import { Group, Paper, SegmentedControl, Stack, Switch, Text, Tooltip, useComputedColorScheme } from '@mantine/core'
import { board, categoryById, fmt, SOURCE_LABEL, type RankedModel } from '../data'
import { heatColor } from '../theme'

interface Props {
  models: RankedModel[]
  onOpen: (id: string, bench?: string) => void
}

export function ScoreMatrix({ models, onOpen }: Props) {
  const [mode, setMode] = useState<'column' | 'absolute'>('column')
  const [hideImputed, setHideImputed] = useState(false)
  const dark = useComputedColorScheme('light') === 'dark'

  // 列按类别分组，组内保持数据文件的顺序
  const benches = useMemo(
    () => board.categories.flatMap(c => board.benchmarks.filter(b => b.category === c.id)),
    [],
  )
  const ranges = useMemo(() => Object.fromEntries(benches.map(b => {
    const xs = models.map(m => m.cells[b.id].value)
    return [b.id, [Math.min(...xs), Math.max(...xs)]]
  })), [benches, models])

  const tone = (bid: string, v: number) => {
    if (mode === 'absolute') return v / 100
    const [lo, hi] = ranges[bid]
    return hi - lo < 1e-6 ? 0.5 : (v - lo) / (hi - lo)
  }

  const groups = board.categories.map(c => ({ c, n: benches.filter(b => b.category === c.id).length })).filter(g => g.n > 0)

  return (
    <Paper className="lb-panel" p="lg">
      <Group justify="space-between" mb="md" wrap="wrap" gap="sm">
        <Stack gap={2}>
          <Text fw={600}>模型 × 评测集分数</Text>
          <Text size="xs" className="lb-muted">
            斜体加斜纹、带 ≈ 的格子是补全值；点任意格子查看出处、配置和其他配置下的分数。
          </Text>
        </Stack>
        <Group gap="md">
          <Switch size="sm" label="隐藏补全值" checked={hideImputed} onChange={e => setHideImputed(e.currentTarget.checked)} />
          <SegmentedControl
            size="xs"
            value={mode}
            onChange={v => setMode(v as 'column' | 'absolute')}
            data={[{ value: 'column', label: '颜色：列内相对' }, { value: 'absolute', label: '颜色：绝对分数' }]}
          />
        </Group>
      </Group>
      <div className="lb-matrix-wrap">
        <table className="lb-matrix">
          <thead>
            <tr>
              <th />
              {groups.map(({ c, n }) => (
                <th key={c.id} colSpan={n} style={{ textAlign: 'left', borderBottom: '1px solid var(--lb-line)' }}>
                  {categoryById[c.id].name}
                </th>
              ))}
            </tr>
            <tr>
              <th style={{ textAlign: 'left' }}>模型</th>
              {benches.map(b => (
                <th key={b.id} style={{ maxWidth: 92 }}>
                  <Tooltip label={`${b.name}｜${b.metric}｜首选配置：${b.preferredSetting}`}>
                    <span style={{ display: 'inline-block', lineHeight: 1.25 }}>{b.name}</span>
                  </Tooltip>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {models.map(m => (
              <tr key={m.id}>
                <td className="is-model" onClick={() => onOpen(m.id)}>
                  <Text size="sm" fw={600} span>{m.live.rank}. {m.name}</Text>
                </td>
                {benches.map(b => {
                  const cell = m.cells[b.id]
                  if (cell.imputed && hideImputed) {
                    return <td key={b.id} style={{ background: 'var(--lb-track)', color: 'var(--lb-ink-3)' }} onClick={() => onOpen(m.id, b.id)}>—</td>
                  }
                  const { bg, fg } = heatColor(tone(b.id, cell.value), dark)
                  const tip = cell.imputed
                    ? `${m.name} · ${b.name}\n补全估计 ${fmt(cell.value)}（±${fmt(1.645 * cell.sd)}，90% 区间）\n没有找到公开分数`
                    : `${m.name} · ${b.name}\n${fmt(cell.value)}（${SOURCE_LABEL[cell.primary!.sourceType]}：${cell.primary!.sourceName}）\n配置：${cell.primary!.setting}${cell.alternates.length ? `\n另有 ${cell.alternates.length} 个其他配置/来源的分数` : ''}`
                  return (
                    <Tooltip key={b.id} label={<span style={{ whiteSpace: 'pre-line' }}>{tip}</span>}>
                      <td
                        className={cell.imputed ? 'is-imputed' : undefined}
                        style={{ background: bg, color: fg }}
                        tabIndex={0}
                        onClick={() => onOpen(m.id, b.id)}
                        onKeyDown={e => e.key === 'Enter' && onOpen(m.id, b.id)}
                      >
                        {cell.imputed ? `≈${fmt(cell.value, 0)}` : fmt(cell.value, cell.value >= 99.95 ? 0 : 1)}
                      </td>
                    </Tooltip>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Group gap={8} mt="md" align="center">
        <Text size="xs" className="lb-muted">{mode === 'column' ? '本列最低' : '0'}</Text>
        <div style={{ display: 'flex', gap: 2 }}>
          {Array.from({ length: 12 }, (_, i) => (
            <div key={i} style={{ width: 18, height: 10, borderRadius: 2, background: heatColor(i / 11, dark).bg }} />
          ))}
        </div>
        <Text size="xs" className="lb-muted">{mode === 'column' ? '本列最高' : '100'}</Text>
      </Group>
    </Paper>
  )
}
