import type { OrgTierType } from '@/models/common/enums'

const CHILD_TIERS: Record<OrgTierType | 'root', OrgTierType[]> = {
  root: ['company'],
  company: ['plant', 'department'],
  plant: ['department', 'workshop'],
  department: ['workshop', 'line'],
  workshop: ['line', 'process'],
  line: ['process', 'shift'],
  process: ['shift'],
  shift: [],
}

export function getAllowedChildTiers(parentTier: OrgTierType | null): OrgTierType[] {
  if (parentTier === null) {
    return CHILD_TIERS.root
  }
  return CHILD_TIERS[parentTier]
}

export function formatTierLabel(tier: OrgTierType): string {
  const labels: Record<OrgTierType, string> = {
    company: 'Company',
    plant: 'Plant',
    department: 'Department',
    workshop: 'Workshop',
    line: 'Production Line',
    process: 'Process',
    shift: 'Shift / Team',
  }
  return labels[tier]
}
