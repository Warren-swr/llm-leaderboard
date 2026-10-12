import raw from './data/leaderboard.json'
import type { Leaderboard, Model } from './types'
import { computeScores, type ScoringInput, type ScoringResult } from './scoring'

export const board = raw as unknown as Leaderboard

export const defaultWeights: Record<string, number> = Object.fromEntries(board.categories.map(c => [c.id, c.weight]))

export const benchById = Object.fromEntries(board.benchmarks.map(b => [b.id, b]))
export const categoryById = Object.fromEntries(board.categories.map(c => [c.id, c]))

const scoringInput: ScoringInput = {
  values: board.models.map(m => board.benchmarks.map(b => m.cells[b.id].value)),
  sd: board.models.map(m => board.benchmarks.map(b => m.cells[b.id].sd)),
  imputed: board.models.map(m => board.benchmarks.map(b => m.cells[b.id].imputed)),
  benchCategory: board.benchmarks.map(b => b.category),
  benchWithin: board.benchmarks.map(b => b.weight),
  benchCvRmse: board.benchmarks.map(b => b.cvRmse ?? 0),
}

export interface RankedModel extends Model {
  live: {
    score: number
    scoreLow: number
    scoreHigh: number
    rank: number
    rankLow: number
    rankHigh: number
    observedOnlyScore: number
    pessimisticRank: number
  }
}

export function rankWith(weights: Record<string, number>): { models: RankedModel[]; result: ScoringResult } {
  const result = computeScores(scoringInput, weights, 1200)
  const models = board.models
    .map((m, i) => ({
      ...m,
      live: {
        score: result.score[i],
        scoreLow: result.scoreLow[i],
        scoreHigh: result.scoreHigh[i],
        rank: result.rank[i],
        rankLow: result.rankLow[i],
        rankHigh: result.rankHigh[i],
        observedOnlyScore: result.observedOnlyScore[i],
        pessimisticRank: result.pessimisticRank[i],
      },
    }))
    .sort((a, b) => a.live.rank - b.live.rank || b.live.score - a.live.score)
  return { models, result }
}

export const fmt = (x: number, d = 1) => (Number.isFinite(x) ? x.toFixed(d) : '—')

export function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

export const SOURCE_LABEL: Record<string, string> = {
  official: '官方自报',
  benchmark_author: '评测集作者',
  third_party: '第三方机构',
  vendor_comparison: '他家对比表',
}
