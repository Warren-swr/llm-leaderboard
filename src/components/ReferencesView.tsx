import { useMemo, useState } from 'react'
import { Anchor, Badge, Group, Paper, Stack, Table, Text, TextInput } from '@mantine/core'
import { IconSearch } from '@tabler/icons-react'
import { board, hostOf } from '../data'

const KIND_LABEL: Record<string, string> = {
  launch_page: '发布页',
  model_card: 'Model card',
  system_card: 'System card',
  tech_report: '技术报告',
  leaderboard: '榜单',
  benchmark: '评测集主页',
  blog: '博客',
  docs: '文档',
  other: '其他',
}

export function ReferencesView() {
  const [q, setQ] = useState('')
  const rows = useMemo(() => {
    const s = q.trim().toLowerCase()
    return board.references.filter(r => !s || r.title.toLowerCase().includes(s) || r.url.toLowerCase().includes(s))
  }, [q])
  return (
    <Paper className="lb-panel" p={0} style={{ overflow: 'hidden' }}>
      <Group justify="space-between" p="lg" pb="md">
        <Stack gap={2}>
          <Text fw={600}>参考来源（{board.references.length}）</Text>
          <Text size="xs" className="lb-muted">本榜用到的全部公开页面。每个分数的具体出处在模型详情里。</Text>
        </Stack>
        <TextInput size="xs" w={260} leftSection={<IconSearch size={14} />} placeholder="按标题或网址筛选" value={q} onChange={e => setQ(e.currentTarget.value)} />
      </Group>
      <Table.ScrollContainer minWidth={720}>
        <Table verticalSpacing="xs" horizontalSpacing="lg">
          <Table.Thead>
            <Table.Tr>
              <Table.Th w={110}>类型</Table.Th>
              <Table.Th>标题</Table.Th>
              <Table.Th>网址</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.map(r => (
              <Table.Tr key={r.url}>
                <Table.Td><Badge size="xs" variant="light" color="gray">{KIND_LABEL[r.kind] ?? r.kind}</Badge></Table.Td>
                <Table.Td><Text size="sm">{r.title}</Text></Table.Td>
                <Table.Td>
                  <Anchor href={r.url} target="_blank" rel="noreferrer" size="xs" className="lb-link">{hostOf(r.url)}{new URL(r.url).pathname.length > 1 ? new URL(r.url).pathname.slice(0, 60) : ''}</Anchor>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Paper>
  )
}
