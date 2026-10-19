import type { ReactNode } from 'react'
import { Anchor } from '@mantine/core'
import { isLinkVisible } from '../links'

export function SourceLink({ url, children, fallback = null }: { url: string; children: ReactNode; fallback?: ReactNode }) {
  if (!isLinkVisible(url)) return fallback
  return <Anchor href={url} target="_blank" rel="noreferrer" size="xs" className="lb-link">{children}</Anchor>
}
