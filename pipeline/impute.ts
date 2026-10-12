// 低秩矩阵补全：在 logit 尺度上用带岭正则的交替最小二乘（ALS）拟合
// 模型 × 评测集分数矩阵，交叉验证选秩与正则强度，bootstrap 估计补全值的不确定性。

export type Matrix = (number | null)[][]

export interface ImputeConfig {
  ranks: number[]
  lambdas: number[]
  folds: number
  cvRepeats: number
  bootstrap: number
  iters: number
  seed: number
}

export interface ImputeResult {
  rank: number
  lambda: number
  cvGrid: { rank: number; lambda: number; rmse: number }[]
  /** 每个评测集的交叉验证误差（原始分数尺度，百分点） */
  cvRmseByCol: number[]
  cvMaeByCol: number[]
  cvRmse: number
  cvMae: number
  /** 补全后的完整矩阵（原始分数尺度）；已知格子保持原值 */
  filled: number[][]
  /** 补全格子的预测标准差（原始尺度）；已知格子为 0 */
  sd: number[][]
  /** 第一主因子得分（模型的“综合能力”坐标），仅供参考 */
  factor1: number[]
}

const EPS = 0.005

export function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** 百分制分数 → 扣除随机基线后的 logit */
export function toLogit(score: number, chance: number): number {
  const p = Math.min(1 - EPS, Math.max(EPS, (score / 100 - chance) / (1 - chance)))
  return Math.log(p / (1 - p))
}

export function fromLogit(z: number, chance: number): number {
  const p = 1 / (1 + Math.exp(-z))
  return 100 * (chance + (1 - chance) * p)
}

/** 解 k×k 线性方程组（高斯消元，带部分主元） */
function solve(A: number[][], b: number[]): number[] {
  const n = b.length
  const M = A.map((row, i) => [...row, b[i]])
  for (let c = 0; c < n; c++) {
    let p = c
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r
    ;[M[c], M[p]] = [M[p], M[c]]
    for (let r = 0; r < n; r++) {
      if (r === c) continue
      const f = M[r][c] / M[c][c]
      for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k]
    }
  }
  return M.map((row, i) => row[n] / row[i])
}

/**
 * 加权 ALS：最小化 Σ w_ij (Z_ij − u_i·v_j)² + λ(‖U‖² + ‖V‖²)。
 * Z 已按列标准化（列均值 0），所以 rank 0 等价于“填列均值”。
 */
function als(Z: number[][], W: number[][], rank: number, lambda: number, iters: number, seed: number): number[][] {
  const n = Z.length
  const m = Z[0].length
  if (rank === 0) return Z.map(row => row.map(() => 0))
  const rnd = mulberry32(seed)
  const U = Array.from({ length: n }, () => Array.from({ length: rank }, () => (rnd() - 0.5) * 0.1))
  const V = Array.from({ length: m }, () => Array.from({ length: rank }, () => (rnd() - 0.5) * 0.1))
  const update = (target: number[][], other: number[][], get: (a: number, b: number) => [number, number]) => {
    for (let a = 0; a < target.length; a++) {
      const A = Array.from({ length: rank }, (_, i) => Array.from({ length: rank }, (_, j) => (i === j ? lambda : 0)))
      const b = new Array(rank).fill(0)
      for (let o = 0; o < other.length; o++) {
        const [z, w] = get(a, o)
        if (w === 0) continue
        const x = other[o]
        for (let i = 0; i < rank; i++) {
          b[i] += w * z * x[i]
          for (let j = 0; j < rank; j++) A[i][j] += w * x[i] * x[j]
        }
      }
      target[a] = solve(A, b)
    }
  }
  for (let t = 0; t < iters; t++) {
    update(U, V, (i, j) => [Z[i][j], W[i][j]])
    update(V, U, (j, i) => [Z[i][j], W[i][j]])
  }
  return U.map(u => V.map(v => u.reduce((s, x, k) => s + x * v[k], 0)))
}

interface Prepared {
  Z: number[][]
  mask: boolean[][]
  mean: number[]
  std: number[]
}

function prepare(X: Matrix, chance: number[], W: number[][]): Prepared {
  const n = X.length
  const m = X[0].length
  const L = X.map(row => row.map((v, j) => (v == null ? 0 : toLogit(v, chance[j]))))
  const mask = X.map(row => row.map(v => v != null))
  const mean: number[] = []
  const std: number[] = []
  for (let j = 0; j < m; j++) {
    let s = 0, s2 = 0, c = 0
    for (let i = 0; i < n; i++) if (mask[i][j] && W[i][j] > 0) { s += W[i][j] * L[i][j]; s2 += W[i][j] * L[i][j] ** 2; c += W[i][j] }
    const mu = c ? s / c : 0
    const sd = c > 1 ? Math.sqrt(Math.max(s2 / c - mu * mu, 1e-6)) : 1
    mean.push(mu)
    std.push(sd)
  }
  const Z = L.map((row, i) => row.map((v, j) => (mask[i][j] ? (v - mean[j]) / std[j] : 0)))
  return { Z, mask, mean, std }
}

function fitPredict(X: Matrix, chance: number[], W: number[][], rank: number, lambda: number, iters: number, seed: number): number[][] {
  const { Z, mean, std } = prepare(X, chance, W)
  const P = als(Z, W, rank, lambda, iters, seed)
  return P.map(row => row.map((z, j) => fromLogit(z * std[j] + mean[j], chance[j])))
}

function observedCells(X: Matrix): [number, number][] {
  const cells: [number, number][] = []
  X.forEach((row, i) => row.forEach((v, j) => { if (v != null) cells.push([i, j]) }))
  return cells
}

const baseWeights = (X: Matrix) => X.map(row => row.map(v => (v == null ? 0 : 1)))

/** K 折交叉验证：遮住一部分已知格子，用剩下的格子补全，再和真实值比较 */
function crossValidate(X: Matrix, chance: number[], rank: number, lambda: number, cfg: ImputeConfig) {
  const m = X[0].length
  const cells = observedCells(X)
  const errs: number[][] = Array.from({ length: m }, () => [])
  for (let rep = 0; rep < cfg.cvRepeats; rep++) {
    const rnd = mulberry32(cfg.seed + 1000 * rep)
    const order = cells.map(c => ({ c, k: rnd() })).sort((a, b) => a.k - b.k).map(o => o.c)
    for (let f = 0; f < cfg.folds; f++) {
      const held = order.filter((_, idx) => idx % cfg.folds === f)
      const W = baseWeights(X)
      for (const [i, j] of held) W[i][j] = 0
      const P = fitPredict(X, chance, W, rank, lambda, cfg.iters, cfg.seed + rep)
      for (const [i, j] of held) errs[j].push(P[i][j] - (X[i][j] as number))
    }
  }
  const rmseByCol = errs.map(e => (e.length ? Math.sqrt(e.reduce((s, x) => s + x * x, 0) / e.length) : NaN))
  const maeByCol = errs.map(e => (e.length ? e.reduce((s, x) => s + Math.abs(x), 0) / e.length : NaN))
  const all = errs.flat()
  return {
    rmse: Math.sqrt(all.reduce((s, x) => s + x * x, 0) / all.length),
    mae: all.reduce((s, x) => s + Math.abs(x), 0) / all.length,
    rmseByCol,
    maeByCol,
  }
}

export function impute(X: Matrix, chance: number[], cfg: ImputeConfig): ImputeResult {
  const m = X[0].length
  const cvGrid: ImputeResult['cvGrid'] = []
  let best = { rank: 0, lambda: 0, rmse: Infinity }
  for (const rank of cfg.ranks) {
    for (const lambda of rank === 0 ? [0] : cfg.lambdas) {
      const { rmse } = crossValidate(X, chance, rank, lambda, cfg)
      cvGrid.push({ rank, lambda, rmse })
      if (rmse < best.rmse - 1e-9) best = { rank, lambda, rmse }
    }
  }
  const cv = crossValidate(X, chance, best.rank, best.lambda, cfg)
  const P = fitPredict(X, chance, baseWeights(X), best.rank, best.lambda, cfg.iters, cfg.seed)

  // bootstrap：按多项分布重抽已知格子的权重，重复补全，得到补全值的抽样方差
  const cells = observedCells(X)
  const draws: number[][][] = []
  for (let b = 0; b < cfg.bootstrap; b++) {
    const rnd = mulberry32(cfg.seed + 7919 * (b + 1))
    const W = X.map(row => row.map(() => 0))
    for (let t = 0; t < cells.length; t++) {
      const [i, j] = cells[Math.floor(rnd() * cells.length)]
      W[i][j] += 1
    }
    draws.push(fitPredict(X, chance, W, best.rank, best.lambda, cfg.iters, cfg.seed + b))
  }
  const filled = X.map((row, i) => row.map((v, j) => (v == null ? P[i][j] : v)))
  const sd = X.map((row, i) => row.map((v, j) => {
    if (v != null) return 0
    const xs = draws.map(D => D[i][j])
    const mu = xs.reduce((s, x) => s + x, 0) / xs.length
    const varBoot = xs.reduce((s, x) => s + (x - mu) ** 2, 0) / Math.max(1, xs.length - 1)
    const colErr = Number.isFinite(cv.rmseByCol[j]) ? cv.rmseByCol[j] : cv.rmse
    // 预测误差 = 参数不确定性（bootstrap）+ 模型本身的拟合误差（交叉验证）
    return Math.sqrt(varBoot + colErr ** 2)
  }))

  // 第一因子：rank-1 拟合的模型坐标，用来对照“综合能力”方向
  const { Z } = prepare(X, chance, baseWeights(X))
  const R1 = als(Z, baseWeights(X), 1, best.lambda || 0.3, cfg.iters, cfg.seed)
  const factor1 = R1.map(row => row.reduce((s, x) => s + x, 0) / m)

  return {
    rank: best.rank,
    lambda: best.lambda,
    cvGrid,
    cvRmseByCol: cv.rmseByCol,
    cvMaeByCol: cv.maeByCol,
    cvRmse: cv.rmse,
    cvMae: cv.mae,
    filled,
    sd,
    factor1,
  }
}
