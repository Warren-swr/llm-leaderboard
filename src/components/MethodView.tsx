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
        <List.Item>同一来源有多个配置（推理档位、是否用工具、pass@1 / pass@k、并行采样）时，优先选与该评测集“首选配置”一致的那个，其次选该模型最高推理档位、单次作答、不加并行采样的结果。</List.Item>
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
        <List.Item>总分 = 各评测集分数（百分制）的加权平均。权重先分到能力类别，再在类别内平均分配。</List.Item>
        <List.Item>默认权重见“总榜”页的滑块；拖动滑块会在浏览器里实时重算。</List.Item>
      </List>
    ),
  },
  {
    label: '检验稳健性',
    desc: '区间与敏感性',
    body: (
      <List size="sm" spacing={6}>
        <List.Item>把补全值按误差随机抽样 1200 次，统计总分和名次的 90% 区间。</List.Item>
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

export function MethodView({ models }: { models: RankedModel[] }) {
  const [step, setStep] = useState(0)
  const imp = board.meta.imputation
  const obsRank = (() => {
    const xs = models.map(m => m.live.observedOnlyScore)
    return Object.fromEntries(models.map((m, i) => [m.id, 1 + xs.filter(y => y > xs[i]).length]))
  })()
  const rho = spearman(models.map(m => m.live.score), models.map(m => m.aaIndex))
  const scatter = [{ color: 'brand.5', name: '模型', data: models.map((m, i) => ({ AA: Number(fmt(m.aaIndex)), 本榜: Number(fmt(m.live.score)), idx: i })) }]

  return (
    <Stack gap="lg">
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
          <Text size="xs" className="lb-muted" mb="md">两者评测集与权重不同，ρ 越接近 1 说明名次越一致。</Text>
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
                  <Paper p="xs" shadow="md" withBorder><Text size="xs" fw={600}>{models[p.idx]?.name}</Text><Text size="xs">AA {p.AA} · 本榜 {p.本榜}</Text></Paper>
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
        <Text size="xs" className="lb-muted" px="lg" pb="md">名次在不同口径下变化越小，结论越可靠。</Text>
        <Table.ScrollContainer minWidth={720}>
          <Table verticalSpacing="xs" horizontalSpacing="lg">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>模型</Table.Th>
                <Table.Th ta="right">本榜</Table.Th>
                <Table.Th ta="right">90% 名次区间</Table.Th>
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
                  <Table.Td ta="right" className="lb-num">#{obsRank[m.id]}（{fmt(m.live.observedOnlyScore)}）</Table.Td>
                  <Table.Td ta="right" className="lb-num">#{m.live.pessimisticRank}</Table.Td>
                  <Table.Td ta="right" className="lb-num">#{m.aaRank}（{fmt(m.aaIndex)}）</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Paper>
    </Stack>
  )
}
