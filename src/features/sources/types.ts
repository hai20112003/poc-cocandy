export type SourceChannel = 'direct' | 'agent' | 'marketplace' | 'referral'
export type SourceStatus = 'active' | 'pipeline' | 'inactive'
export type OnboardingStage = 'contacted' | 'negotiating' | 'sampling' | 'approved'

export interface SupplierSource {
  id: string
  supplierId: string
  channel: SourceChannel
  country: string
  region: string
  status: SourceStatus
  onboardingStage?: OnboardingStage
}
