import { useMemo, useState } from 'react'
import { ActionIcon, Anchor, Container, Group, Stack, Tabs, Text, Title, Tooltip, useMantineColorScheme } from '@mantine/core'
import { IconChartBar, IconGridDots, IconListDetails, IconMath, IconMoon, IconSun, IconLink } from '@tabler/icons-react'
import { board, defaultWeights, rankWith } from './data'
import { StatTiles } from './components/StatTiles'
import { WeightPanel } from './components/WeightPanel'
import { RankingTable } from './components/RankingTable'
import { ScoreMatrix } from './components/ScoreMatrix'
import { BenchmarksView } from './components/BenchmarksView'
import { MethodView } from './components/MethodView'
import { ReferencesView } from './components/ReferencesView'
import { ModelDrawer } from './components/ModelDrawer'

export default function App() {
  const [weights, setWeights] = useState(defaultWeights)
  const [selected, setSelected] = useState<string | null>(null)
  const [focusBench, setFocusBench] = useState<string | null>(null)
  const { models, result } = useMemo(() => rankWith(weights), [weights])
  const { colorScheme, setColorScheme } = useMantineColorScheme()
  const dark = colorScheme === 'dark'
  const custom = Object.keys(weights).some(k => Math.abs(weights[k] - defaultWeights[k]) > 1e-9)

  const open = (id: string, bench?: string) => {
    setSelected(id)
    setFocusBench(bench ?? null)
  }

  return (
    <Container size={1320} py={40} px={{ base: 16, sm: 28 }}>
      <Stack gap={28}>
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Stack gap={8} maw={860}>
            <Text size="xs" fw={600} tt="uppercase" c="brand" style={{ letterSpacing: '0.08em' }}>
              Public Benchmark Leaderboard · 数据截至 {board.meta.dataCutoff}
            </Text>
            <Title order={1} className="lb-hero-title" fz={{ base: 28, sm: 36 }}>
              {board.meta.title}
            </Title>
            <Text className="lb-muted" size="md" lh={1.65}>
              只用公开信息：厂商发布页与 model card 的自报分数优先，评测集作者和第三方机构的分数次之；
              缺失的格子用低秩矩阵补全估计，并标出误差范围。模型名单取自{' '}
              <Anchor href={board.meta.aaSource} target="_blank" rel="noreferrer">
                Artificial Analysis Intelligence Index
              </Anchor>{' '}
              前 20 名（{board.meta.aaRetrieved} 抓取）。
            </Text>
          </Stack>
          <Tooltip label={dark ? '切换到浅色' : '切换到深色'}>
            <ActionIcon variant="default" size="lg" radius="md" aria-label="切换配色" onClick={() => setColorScheme(dark ? 'light' : 'dark')}>
              {dark ? <IconSun size={18} /> : <IconMoon size={18} />}
            </ActionIcon>
          </Tooltip>
        </Group>

        <StatTiles />

        <Tabs defaultValue="ranking" variant="pills" radius="md" keepMounted={false}>
          <Tabs.List mb="lg">
            <Tabs.Tab value="ranking" leftSection={<IconChartBar size={16} />}>总榜</Tabs.Tab>
            <Tabs.Tab value="matrix" leftSection={<IconGridDots size={16} />}>分数矩阵</Tabs.Tab>
            <Tabs.Tab value="benchmarks" leftSection={<IconListDetails size={16} />}>评测集</Tabs.Tab>
            <Tabs.Tab value="method" leftSection={<IconMath size={16} />}>方法与稳健性</Tabs.Tab>
            <Tabs.Tab value="refs" leftSection={<IconLink size={16} />}>参考来源</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="ranking">
            <Stack gap="lg">
              <WeightPanel weights={weights} onChange={setWeights} onReset={() => setWeights(defaultWeights)} custom={custom} />
              <RankingTable models={models} onOpen={open} custom={custom} />
            </Stack>
          </Tabs.Panel>
          <Tabs.Panel value="matrix">
            <ScoreMatrix models={models} onOpen={open} />
          </Tabs.Panel>
          <Tabs.Panel value="benchmarks">
            <BenchmarksView weights={result.benchWeight} />
          </Tabs.Panel>
          <Tabs.Panel value="method">
            <MethodView models={models} />
          </Tabs.Panel>
          <Tabs.Panel value="refs">
            <ReferencesView />
          </Tabs.Panel>
        </Tabs>

        <Text size="xs" className="lb-faint" ta="center" pb="md">
          生成于 {board.meta.generatedAt} · 所有分数均可点开查看原始出处 · 补全值仅用于排序，不代表厂商或机构公布过该分数
        </Text>
      </Stack>

      <ModelDrawer modelId={selected} focusBench={focusBench} models={models} onClose={() => setSelected(null)} />
    </Container>
  )
}
