// 总分计算：管线（默认权重）和页面（用户调权重）共用这一份实现

export interface ScoringInput {
  /** 每个模型、每个评测集的分数（真实或补全） */
  values: number[][]
  /** 补全值的预测标准差，真实分数为 0 */
  sd: number[][]
  imputed: boolean[][]
  /** 每个评测集所属类别 */
  benchCategory: string[]
  /** 类别内各评测集的相对权重 */
  benchWithin: number[]
  /** 补全误差（交叉验证 RMSE），用于悲观情形 */
  benchCvRmse: number[]
}

export interface ScoringResult {
  benchWeight: number[]
  score: number[]
  scoreLow: number[]
  scoreHigh: number[]
  rank: number[]
  rankLow: number[]
  rankHigh: number[]
  observedOnlyScore: (number | null)[]
  observedWeight: number[]
  pessimisticRank: number[]
  categoryScores: Record<string, number>[]
}

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function gaussian(rnd: () => number) {
  const u = Math.max(rnd(), 1e-12)
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rnd())
}

/** 由类别权重展开为每个评测集的权重（合计为 1） */
export function benchWeights(categoryWeights: Record<string, number>, benchCategory: string[], benchWithin: number[]): number[] {
  const withinSum: Record<string, number> = {}
  benchCategory.forEach((c, j) => { withinSum[c] = (withinSum[c] ?? 0) + benchWithin[j] })
  const catTotal = Object.entries(categoryWeights)
    .filter(([c]) => withinSum[c] > 0)
    .reduce((s, [, w]) => s + w, 0)
  return benchCategory.map((c, j) => (catTotal > 0 && withinSum[c] ? ((categoryWeights[c] ?? 0) / catTotal) * (benchWithin[j] / withinSum[c]) : 0))
}

/** 名次：分数高者名次小，同分并列 */
function ranksOf(xs: number[]): number[] {
  return xs.map(x => 1 + xs.filter(y => y > x + 1e-9).length)
}

function quantile(sorted: number[], q: number) {
  const pos = (sorted.length - 1) * q
  const lo = Math.floor(pos)
  const hi = Math.ceil(pos)
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo)
}

export function computeScores(input: ScoringInput, categoryWeights: Record<string, number>, draws = 2000, seed = 20261012): ScoringResult {
  const { values, sd, imputed, benchCategory, benchWithin, benchCvRmse } = input
  const n = values.length
  const m = benchCategory.length
  const w = benchWeights(categoryWeights, benchCategory, benchWithin)
  const dot = (row: number[]) => row.reduce((s, v, j) => s + w[j] * v, 0)

  const score = values.map(dot)
  const rank = ranksOf(score)

  // 补全格子按正态误差抽样，得到总分区间和名次区间（真实分数不抽样）
  const rnd = mulberry32(seed)
  const scoreDraws: number[][] = Array.from({ length: n }, () => [])
  const rankDraws: number[][] = Array.from({ length: n }, () => [])
  for (let d = 0; d < draws; d++) {
    const s = values.map((row, i) => row.reduce((acc, v, j) => {
      const x = sd[i][j] > 0 ? Math.min(100, Math.max(0, v + sd[i][j] * gaussian(rnd))) : v
      return acc + w[j] * x
    }, 0))
    const r = ranksOf(s)
    for (let i = 0; i < n; i++) { scoreDraws[i].push(s[i]); rankDraws[i].push(r[i]) }
  }
  const band = (xs: number[]) => { const s = [...xs].sort((a, b) => a - b); return [quantile(s, 0.05), quantile(s, 0.95)] }
  const scoreBand = scoreDraws.map(band)
  const rankBand = rankDraws.map(band)

  // 只用真实分数：缺失项不计，剩余权重重新归一
  const observedWeight = imputed.map(row => row.reduce((s, missing, j) => s + (missing ? 0 : w[j]), 0))
  const observedOnlyScore = values.map((row, i) => {
    let s = 0
    for (let j = 0; j < m; j++) if (!imputed[i][j]) s += w[j] * row[j]
    return observedWeight[i] > 0 ? s / observedWeight[i] : null
  })

  // 悲观情形：厂商往往不报自己不擅长的评测，把所有补全值下调一个交叉验证误差
  const pessimistic = values.map((row, i) => row.reduce((acc, v, j) => acc + w[j] * (imputed[i][j] ? Math.max(0, v - benchCvRmse[j]) : v), 0))

  const categoryScores = values.map(row => {
    const out: Record<string, number> = {}
    const ws: Record<string, number> = {}
    row.forEach((v, j) => {
      const c = benchCategory[j]
      out[c] = (out[c] ?? 0) + benchWithin[j] * v
      ws[c] = (ws[c] ?? 0) + benchWithin[j]
    })
    for (const c of Object.keys(out)) out[c] /= ws[c]
    return out
  })

  return {
    benchWeight: w,
    score,
    scoreLow: scoreBand.map(b => b[0]),
    scoreHigh: scoreBand.map(b => b[1]),
    rank,
    rankLow: rankBand.map(b => Math.round(b[0])),
    rankHigh: rankBand.map(b => Math.round(b[1])),
    observedOnlyScore,
    observedWeight,
    pessimisticRank: ranksOf(pessimistic),
    categoryScores,
  }
}
