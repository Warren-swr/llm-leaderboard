export const hideGithubLinks = import.meta.env.MODE === 'miaoda'

export function isLinkVisible(url: string) {
  if (!hideGithubLinks) return true
  const host = new URL(url).hostname.toLowerCase()
  return !['github.com', 'github.io', 'githubusercontent.com'].some(domain => host === domain || host.endsWith(`.${domain}`))
}
