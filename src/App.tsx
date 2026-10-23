import { useMemo, useState } from 'react'
import { ActionIcon, Button, Collapse, Container, Group, Stack, Tabs, Text, Title, Tooltip, useMantineColorScheme } from '@mantine/core'
import { IconAdjustmentsHorizontal, IconBrandGithub, IconChevronDown, IconLayoutColumns, IconMoon, IconSun } from '@tabler/icons-react'
import { board, defaultWeights, rankWith } from './data'
import { StatTiles } from './components/StatTiles'
import { WeightPanel } from './components/WeightPanel'
import { RankingTable } from './components/RankingTable'
import { ScoreMatrix } from './components/ScoreMatrix'
import { BenchmarksView } from './components/BenchmarksView'
import { MethodView } from './components/MethodView'
import { ReferencesView } from './components/ReferencesView'
import { ModelDrawer } from './components/ModelDrawer'
import { hideGithubLinks } from './links'

export default function App() {
  const [weights, setWeights] = useState(defaultWeights)
  const [selected, setSelected] = useState<string | null>(null)
  const [focusBench, setFocusBench] = useState<string | null>(null)
  const [weightsOpen, setWeightsOpen] = useState(false)
  const [showBreakdown, setShowBreakdown] = useState(false)
  const { models, result } = useMemo(() => rankWith(weights), [weights])
  const { colorScheme, setColorScheme } = useMantineColorScheme()
  const dark = colorScheme === 'dark'
  const custom = Object.keys(weights).some(k => Math.abs(weights[k] - defaultWeights[k]) > 1e-9)

  const open = (id: string, bench?: string) => {
    setSelected(id)
    setFocusBench(bench ?? null)
  }

  return (
    <Container component="main" size={1320} px={{ base: 16, sm: 32 }} className="lb-shell">
      <Stack gap={0}>
        <header className="lb-header">
          <div>
            <Text className="lb-eyebrow">LLM LEADERBOARD</Text>
            <Title order={1} className="lb-hero-title">{board.meta.title}</Title>
            <Text className="lb-subtitle">汇总公开评测成绩，查看模型表现与原始出处。</Text>
          </div>
          <Group gap={4} wrap="nowrap" className="lb-header-actions">
            {!hideGithubLinks && <Tooltip label="GitHub 仓库：数据、管线与全部出处">
              <ActionIcon component="a" href="https://github.com/Warren-swr/llm-leaderboard" target="_blank" rel="noreferrer" variant="subtle" color="gray" size="lg" radius="md" aria-label="GitHub 仓库">
                <IconBrandGithub size={18} />
              </ActionIcon>
            </Tooltip>}
            <Tooltip label={dark ? '切换到浅色' : '切换到深色'}>
              <ActionIcon variant="subtle" color="gray" size="lg" radius="md" aria-label="切换配色" onClick={() => setColorScheme(dark ? 'light' : 'dark')}>
                {dark ? <IconSun size={18} /> : <IconMoon size={18} />}
              </ActionIcon>
            </Tooltip>
          </Group>
          <Text className="lb-updated">数据截至 {board.meta.dataCutoff}</Text>
        </header>

        <StatTiles />

        <Tabs defaultValue="ranking" variant="default" keepMounted={false} className="lb-tabs">
          <Tabs.List className="lb-tabs-list">
            <Tabs.Tab value="ranking">总榜</Tabs.Tab>
            <Tabs.Tab value="matrix">分数矩阵</Tabs.Tab>
            <Tabs.Tab value="benchmarks">评测集</Tabs.Tab>
            <Tabs.Tab value="method">方法与稳健性</Tabs.Tab>
            <Tabs.Tab value="refs">参考来源</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="ranking">
            <Stack gap={0}>
              <div className="lb-ranking-toolbar">
                <div>
                  <Title order={2} className="lb-section-title">综合排名</Title>
                  <Text className="lb-table-hint">总分含补全估计，点选模型查看详情。</Text>
                </div>
                <Group gap={8} className="lb-ranking-actions">
                  <Button
                    variant="default"
                    size="xs"
                    className="lb-tool-button"
                    data-active={showBreakdown || undefined}
                    leftSection={<IconLayoutColumns size={15} />}
                    aria-pressed={showBreakdown}
                    onClick={() => setShowBreakdown(v => !v)}
                  >能力分项</Button>
                  <Button
                    variant="default"
                    size="xs"
                    className="lb-tool-button"
                    data-active={weightsOpen || custom || undefined}
                    leftSection={<IconAdjustmentsHorizontal size={15} />}
                    rightSection={<IconChevronDown size={13} className={weightsOpen ? 'lb-chevron is-open' : 'lb-chevron'} />}
                    aria-label="调整权重"
                    aria-expanded={weightsOpen}
                    aria-controls="leaderboard-weights"
                    onClick={() => setWeightsOpen(v => !v)}
                  >{custom ? '自定义权重' : '调整权重'}</Button>
                </Group>
              </div>
              <Collapse expanded={weightsOpen} keepMounted={false} id="leaderboard-weights">
                <WeightPanel weights={weights} onChange={setWeights} onReset={() => setWeights(defaultWeights)} custom={custom} />
              </Collapse>
              <RankingTable models={models} onOpen={open} custom={custom} showBreakdown={showBreakdown} />
            </Stack>
          </Tabs.Panel>
          <Tabs.Panel value="matrix">
            <ScoreMatrix models={models} onOpen={open} />
          </Tabs.Panel>
          <Tabs.Panel value="benchmarks">
            <BenchmarksView weights={result.benchWeight} />
          </Tabs.Panel>
          <Tabs.Panel value="method">
            <MethodView models={models} weights={result.benchWeight} />
          </Tabs.Panel>
          <Tabs.Panel value="refs">
            <ReferencesView />
          </Tabs.Panel>
        </Tabs>

        <footer className="lb-footer">
          <span>公开自报优先 · 补全值仅供排序，非官方成绩</span>
          <span>AA 名单快照 {board.meta.aaRetrieved}</span>
        </footer>
      </Stack>

      <ModelDrawer modelId={selected} focusBench={focusBench} models={models} onClose={() => setSelected(null)} />
    </Container>
  )
}
