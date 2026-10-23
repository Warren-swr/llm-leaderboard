import { useState } from 'react'
import { Badge, Group, List, Paper, SimpleGrid, Stack, Stepper, Table, Text } from '@mantine/core'
import { ScatterChart } from '@mantine/charts'
import { board, fmt, type RankedModel } from '../data'

const STEPS = [
  {
    label: '选评测集',
    desc: '三条规则',
    body: (
      <List size="sm" spacing={6}>
        <List.Item>一级来源：OpenAI / Anthropic 最新模型发布页和 model / system card 里用到的评测集。</List.Item>
        <List.Item>二级来源：影响力大、且主流新模型普遍报了分数的评测集。</List.Item>
        <List.Item>已饱和的老评测（头部模型普遍 90 分以上）不收录，因为它们已经区分不出强弱。</List.Item>
      </List>
    ),
  },
  {
    label: '选主分数',
    desc: '官方 > 作者 > 第三方',
    body: (
      <List size="sm" spacing={6}>
        <List.Item>每个模型、每个评测集只取一个主分数参与计算。来源优先级：厂商官方自报 → 评测集作者榜单 → 独立第三方机构 → 其他厂商对比表里的数字。</List.Item>
        <List.Item>只在“可比”的记录里选：同一评测、同一指标。小版本或子集差异（如 HLE 纯文本子集、OSWorld 离线子集）算可比但不是首选；指标定义不同（如 Pass 与 Score、dominance 与 mean@5、all-pass 与 mean pass）的只作参考。</List.Item>
        <List.Item>同一来源有多个配置（推理档位、harness、试验次数）时，先选与首选版本 / 子集一致的，再选厂商作为头条展示的配置（通常是最高推理档、单次作答、不加并行采样）。不按分数高低挑选。</List.Item>
        <List.Item>厂商与评测作者的记录均回源核验；初版由收集与核验两个 agent 分别处理，后续更新按官方模型卡与更新日志交叉核对。口径修正及其理由保留在记录备注或覆盖文件（data/overrides.json）中。</List.Item>
        <List.Item>其他配置或来源的分数保留为参考值，在模型详情里可以看到，但不参与计算。</List.Item>
      </List>
    ),
  },
  {
    label: '补全缺失',
    desc: '低秩矩阵补全',
    body: (
      <List size="sm" spacing={6}>
        <List.Item>先扣除随机作答的基线分，再转换到 logit 尺度并按列标准化，避免高分段被压扁。</List.Item>
        <List.Item>用带岭正则的交替最小二乘拟合低秩矩阵（假设模型能力由少数几个隐藏维度决定），只用真实分数拟合，再用拟合值填补缺口。</List.Item>
        <List.Item>秩和正则强度通过 5 折交叉验证选出：遮住部分已知分数，看补全值与真实值差多少，取误差最小的组合。</List.Item>
        <List.Item>每个补全值的误差 = bootstrap 抽样方差 + 该评测集的交叉验证误差，用于画区间。</List.Item>
      </List>
    ),
  },
  {
    label: '加权汇总',
    desc: '类别权重可调',
    body: (
      <List size="sm" spacing={6}>
        <List.Item>总分 = 各评测集分数（百分制）的加权平均。权重先分到能力类别，再按各评测的类别内权重分配；同一家族的公开 / 私有、Pass / Score 两列共享原家族权重。</List.Item>
        <List.Item>在“总榜”点击“调整权重”展开滑块；拖动后会在浏览器里实时重算，收起面板后保留当前权重。</List.Item>
      </List>
    ),
  },
  {
    label: '检验稳健性',
    desc: '区间与敏感性',
    body: (
      <List size="sm" spacing={6}>
        <List.Item>把补全值按误差随机抽样 2000 次，统计总分和名次的 90% 区间。</List.Item>
        <List.Item>厂商往往不报自己不擅长的评测，补全值因此可能偏高。悲观情形把所有补全值下调一个交叉验证误差，看名次是否变化。</List.Item>
        <List.Item>同时给出“只用真实分数”的总分和 AA 智能指数作为对照。</List.Item>
      </List>
    ),
  },
]

function spearman(a: number[], b: number[]) {
  const rank = (xs: number[]) => xs.map(x => 1 + xs.filter(y => y > x).length + (xs.filter(y => y === x).length - 1) / 2)
  const ra = rank(a), rb = rank(b)
  const n = a.length
  const d2 = ra.reduce((s, r, i) => s + (r - rb[i]) ** 2, 0)
  return 1 - (6 * d2) / (n * (n * n - 1))
}

export function MethodView({ models, weights }: { models: RankedModel[]; weights: number[] }) {
  const [step, setStep] = useState(0)
  const imp = board.meta.imputation
  const obsRank = (() => {
    const observed = models.filter(m => m.live.observedOnlyScore != null)
    return Object.fromEntries(observed.map(m => [m.id, 1 + observed.filter(x => x.live.observedOnlyScore! > m.live.observedOnlyScore!).length]))
  })()
  const aaModels = models.filter((m): m is RankedModel & { aaIndex: number } => m.aaIndex != null)
  const rho = spearman(aaModels.map(m => m.live.score), aaModels.map(m => m.aaIndex))
  const scatter = [{ color: 'brand.5', name: '模型', data: aaModels.map((m, i) => ({ AA: Number(fmt(m.aaIndex)), 本榜: Number(fmt(m.live.score)), idx: i })) }]
  const expansion = board.meta.expansion
  const expandedBenches = board.benchmarks.filter(b => expansion?.benchmarkIds.includes(b.id))
  const deepseek = models.find(m => m.id === 'deepseek-v4-1-flash-1017')

  return (
    <Stack gap="lg">
      {expansion && deepseek && (
        <Paper className="lb-panel" p="lg">
          <Text fw={600} mb="xs">{expansion.date} 新增的排名评测</Text>
          <Text size="sm" className="lb-muted" mb="md">
            DeepSeek 1017 的公开实分由 {expansion.baselineDeepseekObserved}/{expansion.baselineBenchmarkCount} 增至 {Math.round(deepseek.coverage * board.benchmarks.length)}/{board.benchmarks.length}，目前覆盖总权重的 {fmt(deepseek.live.observedWeight * 100)}%。新增列也为其他模型补查公开分数；定义不清的项目和版本没有直接混入。
          </Text>
          <Table.ScrollContainer minWidth={620}>
            <Table verticalSpacing="xs">
              <Table.Thead><Table.Tr><Table.Th>新增评测</Table.Th><Table.Th ta="right">DeepSeek 实分</Table.Th><Table.Th ta="right">全榜公开覆盖</Table.Th><Table.Th ta="right">当前权重</Table.Th></Table.Tr></Table.Thead>
              <Table.Tbody>
                {expandedBenches.map(b => (
                  <Table.Tr key={b.id}>
                    <Table.Td>{b.name}</Table.Td>
                    <Table.Td ta="right" className="lb-num">{deepseek.cells[b.id].imputed ? '—' : fmt(deepseek.cells[b.id].value)}</Table.Td>
                    <Table.Td ta="right"><Badge variant="light" color={b.coverage < 0.25 ? 'orange' : 'gray'}>{Math.round(b.coverage * models.length)}/{models.length}</Badge></Table.Td>
                    <Table.Td ta="right" className="lb-num">{fmt(weights[board.benchmarks.indexOf(b)] * 100)}%</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
          <Text size="xs" className="lb-muted" mt="md">实分增加仍不等于全面实测。低覆盖列的补全依赖其他评测，科研、知识工作等全为估计的类别已在模型详情中标记。</Text>
        </Paper>
      )}
      <Paper className="lb-panel" p="lg">
        <Text fw={600} mb="md">计算流程（点击步骤查看细节）</Text>
        <Stepper active={step} onStepClick={setStep} size="sm" allowNextStepsSelect>
          {STEPS.map(s => (
            <Stepper.Step key={s.label} label={s.label} description={s.desc}>
              <Paper p="md" mt="md" radius="md" style={{ background: 'var(--lb-accent-soft)' }}>{s.body}</Paper>
            </Stepper.Step>
          ))}
        </Stepper>
      </Paper>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        <Paper className="lb-panel" p="lg">
          <Group justify="space-between" mb={4}>
            <Text fw={600}>本榜总分 vs AA 智能指数</Text>
            <Badge variant="light" tt="none">Spearman ρ = {fmt(rho, 2)}</Badge>
          </Group>
          <Text size="xs" className="lb-muted" mb="md">只比较有 AA 指数的 {aaModels.length} 个模型。两者评测集与权重不同，ρ 越接近 1 说明名次越一致。</Text>
          <ScatterChart
            h={300}
            data={scatter}
            dataKey={{ x: 'AA', y: '本榜' }}
            xAxisLabel="AA 智能指数"
            yAxisLabel="本榜总分"
            xAxisProps={{ domain: [(min: number) => Math.floor(min / 5) * 5 - 5, (max: number) => Math.ceil(max / 5) * 5 + 5], type: 'number' }}
            yAxisProps={{ domain: [(min: number) => Math.floor(min / 5) * 5 - 5, (max: number) => Math.ceil(max / 5) * 5 + 5], type: 'number' }}
            tooltipProps={{
              content: ({ payload }) => {
                const p = payload?.[0]?.payload as { idx: number; AA: number; 本榜: number } | undefined
                return p ? (
                  <Paper p="xs" shadow="md" withBorder><Text size="xs" fw={600}>{aaModels[p.idx]?.name}</Text><Text size="xs">AA {p.AA} · 本榜 {p.本榜}</Text></Paper>
                ) : null
              },
            }}
          />
        </Paper>

        <Paper className="lb-panel" p="lg">
          <Text fw={600} mb={4}>补全模型</Text>
          <Text size="xs" className="lb-muted" mb="md">交叉验证选出的参数与误差（原始分数尺度，百分点）。</Text>
          <SimpleGrid cols={2} spacing="sm" mb="md">
            <Stack gap={0}><Text size="xs" className="lb-faint">秩 / 正则强度</Text><Text fw={650}>{imp.rank} / {imp.lambda}</Text></Stack>
            <Stack gap={0}><Text size="xs" className="lb-faint">补全格子</Text><Text fw={650}>{imp.imputedCells} / {imp.totalCells}</Text></Stack>
            <Stack gap={0}><Text size="xs" className="lb-faint">交叉验证 RMSE</Text><Text fw={650}>{fmt(imp.cvRmse)}</Text></Stack>
            <Stack gap={0}><Text size="xs" className="lb-faint">交叉验证 MAE</Text><Text fw={650}>{fmt(imp.cvMae)}</Text></Stack>
          </SimpleGrid>
          <Text size="xs" className="lb-muted" lh={1.6}>{imp.method}</Text>
          <List size="xs" mt="sm" spacing={4} className="lb-muted">
            {board.meta.notes.map((n, i) => <List.Item key={i}>{n}</List.Item>)}
          </List>
        </Paper>
      </SimpleGrid>

      <Paper className="lb-panel" p={0} style={{ overflow: 'hidden' }}>
        <Text fw={600} p="lg" pb="xs">名次对照</Text>
        <Text size="xs" className="lb-muted" px="lg" pb="md">同时检查名次变化和实分覆盖的权重。各模型公开实分所在的评测不同，“只用真实分数”一栏只作对照；区间未覆盖所有厂商自报和口径差异。</Text>
        <Table.ScrollContainer minWidth={720}>
          <Table verticalSpacing="xs" horizontalSpacing="lg">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>模型</Table.Th>
                <Table.Th ta="right">本榜</Table.Th>
                <Table.Th ta="right">90% 名次区间</Table.Th>
                <Table.Th ta="right">实分权重</Table.Th>
                <Table.Th ta="right">只用真实分数</Table.Th>
                <Table.Th ta="right">补全值下调一个误差</Table.Th>
                <Table.Th ta="right">AA 智能指数</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {models.map(m => (
                <Table.Tr key={m.id}>
                  <Table.Td><Text size="sm" fw={550}>{m.name}</Text></Table.Td>
                  <Table.Td ta="right" className="lb-num">#{m.live.rank}</Table.Td>
                  <Table.Td ta="right" className="lb-num">{m.live.rankLow}–{m.live.rankHigh}</Table.Td>
                  <Table.Td ta="right" className="lb-num">{fmt(m.live.observedWeight * 100)}%</Table.Td>
                  <Table.Td ta="right" className="lb-num">{m.live.observedOnlyScore == null ? '—' : `#${obsRank[m.id]}（${fmt(m.live.observedOnlyScore)}）`}</Table.Td>
                  <Table.Td ta="right" className="lb-num">#{m.live.pessimisticRank}</Table.Td>
                  <Table.Td ta="right" className="lb-num">{m.aaRank == null || m.aaIndex == null ? '—' : `#${m.aaRank}（${fmt(m.aaIndex)}）`}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Paper>
    </Stack>
  )
}
