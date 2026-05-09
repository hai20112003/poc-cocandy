import type { SupplierSource, SourceChannel, SourceStatus, OnboardingStage } from '@/features/sources/types'

const CHANNELS: SourceChannel[] = ['direct', 'agent', 'marketplace', 'referral']
const COUNTRIES = ['Vietnam', 'China', 'Indonesia', 'Thailand', 'Bangladesh', 'India', 'Cambodia', 'Malaysia', 'Myanmar', 'Sri Lanka']
const REGIONS = ['Southeast Asia', 'East Asia', 'South Asia', 'Central Asia', 'Southeast Asia', 'South Asia']
const STATUSES: SourceStatus[] = ['active', 'active', 'pipeline', 'active', 'inactive', 'pipeline']
const STAGES: OnboardingStage[] = ['contacted', 'negotiating', 'sampling', 'approved']

export const mockSources: SupplierSource[] = Array.from({ length: 25 }, (_, i) => {
  const status = STATUSES[i % STATUSES.length]
  return {
    id: `src-${i + 1}`,
    supplierId: `s${(i % 20) + 1}`,
    channel: CHANNELS[i % CHANNELS.length],
    country: COUNTRIES[i % COUNTRIES.length],
    region: REGIONS[i % REGIONS.length],
    status,
    onboardingStage: status === 'pipeline' ? STAGES[i % STAGES.length] : undefined,
  }
})
