// 管线（pipeline/build.ts）输出、页面读取的数据结构

export type SourceType = 'official' | 'benchmark_author' | 'third_party' | 'vendor_comparison'

export interface ScoreRecord {
  score: number
  setting: string
  sourceType: SourceType
  sourceName: string
  url: string
  quote?: string
  note?: string
}

export interface Cell {
  /** 参与计算的值：真实主分数，或补全值 */
  value: number
  imputed: boolean
  /** 补全值的预测标准差（百分点），真实分数为 0 */
  sd: number
  primary?: ScoreRecord
  alternates: ScoreRecord[]
}

export interface Category {
  id: string
  name: string
  weight: number
  description: string
}

export interface Benchmark {
  id: string
  name: string
  category: string
  /** 在总分中的权重（所有评测集合计为 1） */
  weight: number
  metric: string
  preferredSetting: string
  chance: number
  url: string
  description: string
  selectionReason: string
  tier: 1 | 2
  addedAt?: string
  coverage: number
  cvRmse: number | null
  topScore: number
}

export interface Model {
  id: string
  name: string
  vendor: string
  releaseDate: string
  /** 是否已公开权重；开源分类也包含已公告的开放计划 */
  openWeights: boolean
  openWeightsPlan?: {
    releaseDate?: string
    url: string
  }
  /** 补充收录且不在 AA 快照中的版本为 null */
  aaRank: number | null
  aaIndex: number | null
  aaVariant: string | null
  rank: number
  score: number
  scoreLow: number
  scoreHigh: number
  /** 模拟抽样下的 90% 名次区间 */
  rankLow: number
  rankHigh: number
  /** 只用真实分数时的总分（缺失项按剩余权重重新归一），供对照 */
  observedOnlyScore: number | null
  /** 补全值整体下调一个交叉验证误差后的名次（缺失非随机的敏感性分析） */
  pessimisticRank: number
  coverage: number
  /** 有公开实分的评测所覆盖的总权重 */
  observedWeight: number
  categoryScores: Record<string, number>
  cells: Record<string, Cell>
}

export interface Reference {
  url: string
  title: string
  kind: string
}

export interface Leaderboard {
  meta: {
    title: string
    generatedAt: string
    dataCutoff: string
    aaSource: string
    aaRetrieved: string
    imputation: {
      method: string
      rank: number
      lambda: number
      cvRmse: number
      cvMae: number
      imputedCells: number
      totalCells: number
    }
    notes: string[]
    expansion?: {
      date: string
      baselineBenchmarkCount: number
      baselineDeepseekObserved: number
      benchmarkIds: string[]
    }
  }
  categories: Category[]
  benchmarks: Benchmark[]
  models: Model[]
  references: Reference[]
}
