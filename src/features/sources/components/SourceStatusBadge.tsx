import { StatusBadge } from '@/components/shared/StatusBadge'
import type { SourceStatus, OnboardingStage } from '../types'

const STATUS_CONFIG: Record<SourceStatus, { label: string; variant: 'success' | 'warning' | 'default' }> = {
  active: { label: 'Active', variant: 'success' },
  pipeline: { label: 'Pipeline', variant: 'warning' },
  inactive: { label: 'Inactive', variant: 'default' },
}

const STAGE_CONFIG: Record<OnboardingStage, { label: string; variant: 'default' | 'info' | 'warning' | 'success' }> = {
  contacted: { label: 'Contacted', variant: 'default' },
  negotiating: { label: 'Negotiating', variant: 'info' },
  sampling: { label: 'Sampling', variant: 'warning' },
  approved: { label: 'Approved', variant: 'success' },
}

export function SourceStatusBadge({ status }: { status: SourceStatus }) {
  const c = STATUS_CONFIG[status]
  return <StatusBadge variant={c.variant}>{c.label}</StatusBadge>
}

export function OnboardingStageBadge({ stage }: { stage?: OnboardingStage }) {
  if (!stage) return null
  const c = STAGE_CONFIG[stage]
  return <StatusBadge variant={c.variant}>{c.label}</StatusBadge>
}
