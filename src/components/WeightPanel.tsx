import { Badge, Button, Group, Paper, SimpleGrid, Slider, Stack, Text, Tooltip } from '@mantine/core'
import { IconAdjustments, IconRestore } from '@tabler/icons-react'
import { board, fmt } from '../data'

interface Props {
  weights: Record<string, number>
  onChange: (w: Record<string, number>) => void
  onReset: () => void
  custom: boolean
}

export function WeightPanel({ weights, onChange, onReset, custom }: Props) {
  const total = Object.values(weights).reduce((s, x) => s + x, 0) || 1
  return (
    <Paper className="lb-panel" p="lg">
      <Group justify="space-between" mb="md">
        <Group gap={8}>
          <IconAdjustments size={18} />
          <Text fw={600}>类别权重</Text>
          {custom ? <Badge variant="light" color="orange">自定义</Badge> : <Badge variant="light">默认</Badge>}
        </Group>
        <Button size="xs" variant="subtle" leftSection={<IconRestore size={14} />} onClick={onReset} disabled={!custom}>
          恢复默认
        </Button>
      </Group>
      <SimpleGrid cols={{ base: 1, sm: 2, md: board.categories.length > 4 ? 3 : board.categories.length }} spacing="lg" verticalSpacing="md">
        {board.categories.map(c => {
          const benches = board.benchmarks.filter(b => b.category === c.id)
          return (
            <Stack key={c.id} gap={6}>
              <Group justify="space-between" gap={4}>
                <Tooltip label={`${c.description}｜包含：${benches.map(b => b.name).join('、')}`}>
                  <Text size="sm" fw={550} style={{ cursor: 'help' }}>{c.name}</Text>
                </Tooltip>
                <Text size="sm" className="lb-num lb-muted">{fmt((weights[c.id] / total) * 100)}%</Text>
              </Group>
              <Slider
                value={weights[c.id]}
                onChange={v => onChange({ ...weights, [c.id]: v })}
                min={0}
                max={0.5}
                step={0.01}
                label={null}
                size="sm"
                thumbLabel={`${c.name} 权重`}
              />
            </Stack>
          )
        })}
      </SimpleGrid>
      <Text size="xs" className="lb-faint" mt="md">
        拖动滑块会实时重算总分、区间与名次；权重按比例归一，合计始终为 100%。
      </Text>
    </Paper>
  )
}
