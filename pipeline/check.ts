// 发布前的数据检查：读取 src/data/leaderboard.json，发现问题时以非零码退出。
// 用法：npm run check:data

import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Leaderboard } from '../src/types'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const board = JSON.parse(readFileSync(join(ROOT, 'src/data/leaderboard.json'), 'utf8')) as Leaderboard

const errors: string[] = []
const warnings: string[] = []

const wsum = board.categories.reduce((s, c) => s + c.weight, 0)
if (Math.abs(wsum - 1) > 1e-6) errors.push(`类别权重合计 ${wsum}，应为 1`)

for (const b of board.benchmarks) {
  if (!b.url) errors.push(`评测集 ${b.id} 缺主页网址`)
  if (b.coverage < 0.25) warnings.push(`评测集 ${b.id} 真实分数覆盖只有 ${(b.coverage * 100).toFixed(0)}%`)
  if (b.topScore >= 90) warnings.push(`评测集 ${b.id} 榜内最高 ${b.topScore}，接近饱和`)
}

const ids = new Set<string>()
for (const m of board.models) {
  if (ids.has(m.id)) errors.push(`重复模型 ${m.id}`)
  ids.add(m.id)
  for (const b of board.benchmarks) {
    const c = m.cells[b.id]
    if (!c) { errors.push(`${m.id} 缺 ${b.id} 格子`); continue }
    if (!(c.value >= 0 && c.value <= 100)) errors.push(`${m.id}/${b.id} 值 ${c.value} 超出 0–100`)
    if (!c.imputed) {
      const p = c.primary
      if (!p) { errors.push(`${m.id}/${b.id} 非补全格子却没有主分数`); continue }
      if (!/^https?:\/\//.test(p.url)) errors.push(`${m.id}/${b.id} 主分数缺有效网址`)
      if (p.note?.includes('未经回源核验')) warnings.push(`${m.id}/${b.id} 主分数未经回源核验（${p.sourceName}）`)
      if (p.note?.includes('无法打开')) warnings.push(`${m.id}/${b.id} 主分数核验时无法打开原网页（${p.sourceName}）`)
    }
    for (const r of c.alternates) if (!/^https?:\/\//.test(r.url)) errors.push(`${m.id}/${b.id} 参考值缺有效网址`)
  }
  if (m.coverage < 0.5) warnings.push(`${m.name} 真实分数覆盖只有 ${(m.coverage * 100).toFixed(0)}%`)
}

for (const w of warnings) console.log(`WARN  ${w}`)
for (const e of errors) console.log(`ERROR ${e}`)
console.log(`${errors.length} 个错误，${warnings.length} 个提示`)
process.exit(errors.length ? 1 : 0)
