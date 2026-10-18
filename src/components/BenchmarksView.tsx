import { Anchor, Badge, Group, Paper, Progress, SimpleGrid, Stack, Text, Tooltip } from '@mantine/core'
import { IconExternalLink } from '@tabler/icons-react'
import { board, fmt, hostOf } from '../data'

export function BenchmarksView({ weights }: { weights: number[] }) {
  return (
    <Stack gap="xl">
      {board.categories.map(c => {
        const items = board.benchmarks.map((b, j) => ({ b, w: weights[j] })).filter(x => x.b.category === c.id)
        return (
          <Stack key={c.id} gap="sm">
            <Group gap={10} align="baseline">
              <Text fw={650} size="lg">{c.name}</Text>
              <Text size="sm" className="lb-muted">{c.description}</Text>
            </Group>
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
              {items.map(({ b, w }) => (
                <Paper key={b.id} className="lb-panel" p="lg">
                  <Stack gap={10}>
                    <Group justify="space-between" wrap="nowrap" align="flex-start">
                      <Stack gap={2}>
                        <Text fw={650}>{b.name}</Text>
                        <Text size="xs" className="lb-muted">{b.metric} · 首选配置：{b.preferredSetting}</Text>
                      </Stack>
                      <Tooltip label={b.addedAt ? `${b.addedAt} 新增；指标范围、覆盖率与采用权重见入选理由` : b.tier === 1 ? 'OpenAI / Anthropic 最新发布页或 model card 中使用' : '影响力大、主流新模型普遍有分数'}>
                        <Badge variant={b.tier === 1 ? 'filled' : 'light'}>{b.addedAt ? '扩展评测' : b.tier === 1 ? '一级来源' : '二级来源'}</Badge>
                      </Tooltip>
                    </Group>
                    <Text size="sm" lh={1.6}>{b.description}</Text>
                    <Text size="xs" className="lb-muted" lh={1.6}>入选理由：{b.selectionReason}</Text>
                    <SimpleGrid cols={3} spacing="xs">
                      <Stack gap={2}>
                        <Text size="xs" className="lb-faint">总分权重</Text>
                        <Text size="sm" fw={600} className="lb-num">{fmt(w * 100)}%</Text>
                      </Stack>
                      <Stack gap={2}>
                        <Text size="xs" className="lb-faint">榜内最高</Text>
                        <Text size="sm" fw={600} className="lb-num">{fmt(b.topScore)}</Text>
                      </Stack>
                      <Stack gap={2}>
                        <Tooltip label="遮住已知分数再补全，补全值与真实值的均方根误差">
                          <Text size="xs" className="lb-faint" style={{ cursor: 'help' }}>补全误差</Text>
                        </Tooltip>
                        <Text size="sm" fw={600} className="lb-num">{b.cvRmse == null ? '—' : `±${fmt(b.cvRmse)}`}</Text>
                      </Stack>
                    </SimpleGrid>
                    <Stack gap={4}>
                      <Group justify="space-between">
                        <Text size="xs" className="lb-faint">真实分数覆盖</Text>
                        <Text size="xs" className="lb-num lb-muted">{Math.round(b.coverage * board.models.length)}/{board.models.length}</Text>
                      </Group>
                      <Progress value={b.coverage * 100} size="sm" radius="xl" />
                    </Stack>
                    <Anchor href={b.url} target="_blank" rel="noreferrer" size="xs" className="lb-link">
                      <Group gap={4} wrap="nowrap"><IconExternalLink size={12} />{hostOf(b.url)}</Group>
                    </Anchor>
                  </Stack>
                </Paper>
              ))}
            </SimpleGrid>
          </Stack>
        )
      })}
    </Stack>
  )
}
