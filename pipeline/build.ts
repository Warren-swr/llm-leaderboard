// 读取 data/ 下的评测集定义、模型名单和逐模型分数记录，
// 选出主分数 → 低秩补全缺失 → 加权汇总 → 写出 src/data/leaderboard.json。
// 用法：npm run data

import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { impute } from './impute'
import { computeScores } from '../src/scoring'
import type { Benchmark, Category, Cell, Leaderboard, Model, Reference, ScoreRecord, SourceType } from '../src/types'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const readJson = <T>(p: string): T => JSON.parse(readFileSync(join(ROOT, p), 'utf8')) as T

interface BenchmarkDef extends Omit<Benchmark, 'coverage' | 'cvRmse' | 'topScore'> {}
interface BenchFile { categories: Category[]; benchmarks: BenchmarkDef[] }
type ModelDef = Pick<Model, 'id' | 'name' | 'vendor' | 'releaseDate' | 'openWeights' | 'openWeightsPlan' | 'aaRank' | 'aaIndex' | 'aaVariant'>
interface RawRecord extends ScoreRecord {
  benchmark: string
  /** 与评测集首选配置一致 */
  matchesPreferred?: boolean
  /** 收集者在同一来源的多个配置中标记的主配置 */
  primaryHint?: boolean
  /** 回源核验结果：false 表示核验未通过，不参与计算 */
  verified?: boolean
  /** 与本列的版本、子集、指标定义一致；false 的记录只作参考，不能当主分数 */
  comparable?: boolean
}
interface ScoreFile { model: string; records: RawRecord[]; references?: Reference[] }
interface RefFile { references: Reference[] }

const SOURCE_RANK: Record<SourceType, number> = { official: 0, benchmark_author: 1, third_party: 2, vendor_comparison: 3 }

/**
 * 主分数选择：只在“可比”记录里选；顺序为来源优先级 → 是否匹配首选配置 → 收集者主配置标记 → 记录顺序。
 * 不按分数高低选。不可比记录排在参考值末尾。
 */
export function pickPrimary(records: RawRecord[]): { primary?: RawRecord; alternates: RawRecord[] } {
  const usable = records.filter(r => r.verified !== false && Number.isFinite(r.score))
  const nonComparable = usable.filter(r => r.comparable === false)
  const sorted = usable
    .filter(r => r.comparable !== false)
    .map((r, idx) => ({ r, idx }))
    .sort((a, b) =>
      SOURCE_RANK[a.r.sourceType] - SOURCE_RANK[b.r.sourceType] ||
      Number(b.r.verified === true) - Number(a.r.verified === true) ||
      Number(!!b.r.matchesPreferred) - Number(!!a.r.matchesPreferred) ||
      Number(!!b.r.primaryHint) - Number(!!a.r.primaryHint) ||
      a.idx - b.idx)
    .map(x => x.r)
  return { primary: sorted[0], alternates: [...sorted.slice(1), ...nonComparable] }
}

const strip = (r: RawRecord): ScoreRecord => {
  const { score, setting, sourceType, sourceName, url, quote, note } = r
  return { score, setting, sourceType, sourceName, url, ...(quote ? { quote } : {}), ...(note ? { note } : {}) }
}

function main() {
  const bf = readJson<BenchFile>('data/benchmarks.json')
  // 开发用：--allow-sparse 时跳过真实分数不足 3 个的列（正式数据不应使用）
  const allowSparse = process.argv.includes('--allow-sparse')
  const models = readJson<{ models: ModelDef[] }>('data/models.json').models
  const refFile = readJson<RefFile>('data/references.json')
  // 原有记录、AA 冻结快照，以及后续扩展列的独立记录，分别维护。
  const scoreFiles: Record<string, ScoreFile> = {}
  for (const dir of ['data/scores', 'data/scores-aa', 'data/scores-expanded']) {
    for (const f of readdirSync(join(ROOT, dir)).filter(f => f.endsWith('.json'))) {
      const s = readJson<ScoreFile>(`${dir}/${f}`)
      const cur = (scoreFiles[s.model] ??= { model: s.model, records: [], references: [] })
      cur.records.push(...s.records)
      cur.references!.push(...(s.references ?? []))
    }
  }
  // 人工复核覆盖：每条都必须命中至少一条记录，避免数据更新后静默失效
  const { overrides } = readJson<{ overrides: { model: string; benchmark: string; urlContains: string; set: Partial<RawRecord>; reason: string; replaceNote?: boolean }[] }>('data/overrides.json')
  for (const o of overrides) {
    const hits = (scoreFiles[o.model]?.records ?? []).filter(r => r.benchmark === o.benchmark && r.url.includes(o.urlContains))
    if (!hits.length) throw new Error(`覆盖规则未命中任何记录：${o.model}/${o.benchmark}/${o.urlContains}`)
    for (const r of hits) {
      Object.assign(r, o.set)
      r.note = [o.replaceNote ? '' : r.note, `人工复核：${o.reason}`].filter(Boolean).join('；')
    }
  }

  const benchIds = new Set(bf.benchmarks.map(b => b.id))
  for (const s of Object.values(scoreFiles)) {
    for (const r of s.records) if (!benchIds.has(r.benchmark)) throw new Error(`${s.model}: 未知评测集 ${r.benchmark}`)
    if (!models.some(m => m.id === s.model)) throw new Error(`未知模型 ${s.model}`)
  }

  // 选主分数
  const pickAll = () => models.map(m => bf.benchmarks.map(b => pickPrimary((scoreFiles[m.id]?.records ?? []).filter(r => r.benchmark === b.id))))
  let picks = pickAll()
  const observedCount = (j: number) => picks.filter(row => row[j].primary).length
  const sparse = bf.benchmarks.filter((_, j) => observedCount(j) < 3)
  if (sparse.length) {
    const msg = sparse.map(b => b.id).join(', ')
    if (!allowSparse) throw new Error(`以下评测集真实分数不足 3 个，无法补全：${msg}`)
    console.warn(`[allow-sparse] 跳过：${msg}`)
    bf.benchmarks = bf.benchmarks.filter(b => !sparse.includes(b))
    picks = pickAll()
  }
  const X = picks.map(row => row.map(p => (p.primary ? p.primary.score : null)))
  const chance = bf.benchmarks.map(b => b.chance)

  const imp = impute(X, chance, { ranks: [0, 1, 2, 3], lambdas: [0.1, 0.3, 1, 3], folds: 5, cvRepeats: 4, bootstrap: 200, iters: 80, seed: 20261012 })

  const imputedMask = X.map(row => row.map(v => v == null))
  const scoring = computeScores(
    {
      values: imp.filled,
      sd: imp.sd,
      imputed: imputedMask,
      benchCategory: bf.benchmarks.map(b => b.category),
      benchWithin: bf.benchmarks.map(b => b.weight),
      benchCvRmse: imp.cvRmseByCol,
    },
    Object.fromEntries(bf.categories.map(c => [c.id, c.weight])),
  )

  const outModels: Model[] = models.map((m, i) => {
    const cells: Record<string, Cell> = {}
    bf.benchmarks.forEach((b, j) => {
      const p = picks[i][j]
      cells[b.id] = {
        value: Math.round(imp.filled[i][j] * 100) / 100,
        imputed: imputedMask[i][j],
        sd: Math.round(imp.sd[i][j] * 100) / 100,
        ...(p.primary ? { primary: strip(p.primary) } : {}),
        alternates: p.alternates.map(strip),
      }
    })
    return {
      ...m,
      rank: scoring.rank[i],
      score: scoring.score[i],
      scoreLow: scoring.scoreLow[i],
      scoreHigh: scoring.scoreHigh[i],
      rankLow: scoring.rankLow[i],
      rankHigh: scoring.rankHigh[i],
      observedOnlyScore: scoring.observedOnlyScore[i],
      observedWeight: scoring.observedWeight[i],
      pessimisticRank: scoring.pessimisticRank[i],
      coverage: X[i].filter(v => v != null).length / bf.benchmarks.length,
      categoryScores: scoring.categoryScores[i],
      cells,
    }
  })

  const outBench: Benchmark[] = bf.benchmarks.map((b, j) => ({
    ...b,
    coverage: X.filter(row => row[j] != null).length / models.length,
    cvRmse: Number.isFinite(imp.cvRmseByCol[j]) ? Math.round(imp.cvRmseByCol[j] * 100) / 100 : null,
    topScore: Math.max(...X.map(row => row[j] ?? -Infinity)),
  }))

  // 参考文献：手工维护的总表 + 每条分数记录里出现的网址（去重）
  const refs = new Map<string, Reference>()
  for (const r of refFile.references) refs.set(r.url, r)
  for (const s of Object.values(scoreFiles)) for (const r of s.references ?? []) if (!refs.has(r.url)) refs.set(r.url, r)
  for (const s of Object.values(scoreFiles)) for (const r of s.records) {
    if (!refs.has(r.url)) refs.set(r.url, { url: r.url, title: r.sourceName, kind: 'other' })
  }
  for (const b of bf.benchmarks) if (b.url && !refs.has(b.url)) refs.set(b.url, { url: b.url, title: `${b.name} 主页`, kind: 'benchmark' })

  const totalCells = models.length * bf.benchmarks.length
  const imputedCells = imputedMask.flat().filter(Boolean).length
  const meta = readJson<{ title: string; dataCutoff: string; aaSource: string; aaRetrieved: string; notes: string[] }>('data/meta.json')
  const out: Leaderboard = {
    meta: {
      ...meta,
      generatedAt: process.env.LB_GENERATED_AT ?? new Date().toISOString().slice(0, 10),
      imputation: {
        method: '在扣除随机基线后的 logit 尺度上按列标准化，用带岭正则的交替最小二乘做低秩矩阵补全；秩与正则强度由 5 折 × 4 次重复的交叉验证选出；补全误差 = bootstrap（200 次）方差 + 该评测集交叉验证误差。',
        rank: imp.rank,
        lambda: imp.lambda,
        cvRmse: Math.round(imp.cvRmse * 100) / 100,
        cvMae: Math.round(imp.cvMae * 100) / 100,
        imputedCells,
        totalCells,
      },
    },
    categories: bf.categories,
    benchmarks: outBench,
    models: outModels,
    references: [...refs.values()].sort((a, b) => a.kind.localeCompare(b.kind) || a.title.localeCompare(b.title)),
  }
  mkdirSync(join(ROOT, 'src/data'), { recursive: true })
  writeFileSync(join(ROOT, 'src/data/leaderboard.json'), JSON.stringify(out, null, 1))

  console.log(`秩 ${imp.rank}，λ ${imp.lambda}，CV RMSE ${imp.cvRmse.toFixed(2)}，MAE ${imp.cvMae.toFixed(2)}；补全 ${imputedCells}/${totalCells}`)
  console.log(imp.cvGrid.map(g => `${g.rank}/${g.lambda}:${g.rmse.toFixed(2)}`).join('  '))
  const order = outModels.map((m, i) => ({ m, i })).sort((a, b) => a.m.rank - b.m.rank)
  for (const { m } of order) {
    console.log(`${String(m.rank).padStart(2)} [${m.rankLow}-${m.rankHigh}] ${m.score.toFixed(1)} (${m.scoreLow.toFixed(1)}–${m.scoreHigh.toFixed(1)}) cov ${(m.coverage * 100).toFixed(0)}%  ${m.aaRank == null ? 'AA 快照未收录' : `AA#${m.aaRank}`}  ${m.name}`)
  }
}

main()
