import { createTheme, type MantineColorsTuple } from '@mantine/core'

// 主色取自数据可视化参考色板的蓝色序列（单色相，浅→深）
const brand: MantineColorsTuple = [
  '#eef5fe', '#cde2fb', '#9ec5f4', '#6da7ec', '#3987e5',
  '#2a78d6', '#256abf', '#1c5cab', '#184f95', '#104281',
]

export const theme = createTheme({
  primaryColor: 'brand',
  primaryShade: { light: 5, dark: 4 },
  colors: { brand },
  fontFamily:
    'Inter, "SF Pro Text", -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Segoe UI", sans-serif',
  fontFamilyMonospace: '"JetBrains Mono", "SF Mono", Menlo, Consolas, monospace',
  headings: { fontWeight: '650' },
  defaultRadius: 'md',
  cursorType: 'pointer',
  components: {
    Paper: { defaultProps: { radius: 'lg' } },
    Tooltip: { defaultProps: { withArrow: true, openDelay: 80, multiline: true, maw: 360 } },
  },
})

/** 热力图格子：分数（0–100）映射到蓝色序列。返回背景色与文字色 */
const SEQ = ['#eef5fe', '#cde2fb', '#b7d3f6', '#9ec5f4', '#86b6ef', '#6da7ec', '#5598e7', '#3987e5', '#2a78d6', '#256abf', '#1c5cab', '#184f95']
const SEQ_DARK = ['#1d2633', '#1f2f45', '#203a58', '#22466c', '#245280', '#265e93', '#2a6aa6', '#3478bb', '#3f86cc', '#4c94db', '#5ea3e6', '#74b2ee']

export function heatColor(t: number, dark: boolean): { bg: string; fg: string } {
  const x = Math.max(0, Math.min(1, t))
  const ramp = dark ? SEQ_DARK : SEQ
  const idx = Math.round(x * (ramp.length - 1))
  const fg = dark ? (idx >= 8 ? '#0b1220' : '#e8eef7') : idx >= 7 ? '#ffffff' : '#0b1b33'
  return { bg: ramp[idx], fg }
}
