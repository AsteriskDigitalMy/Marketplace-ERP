import { randomDelay } from '@/lib/api/delay'
import { ApiError } from '@/lib/api/errors'
import type { CockpitRole } from '@/models/common/enums'
import type { DrillDownNode, DrillDownRequest, RoleCockpit } from '@/models/pms/operations'
import {
  cockpitDrillDownStore,
} from '@/mocks/pms/cockpit-drill-down-store'
import {
  roleCockpitStore,
  type CockpitWidgetSection,
} from '@/mocks/pms/role-cockpit-store'

export type { CockpitWidgetSection }

const SUPPORTED_ROLES: CockpitRole[] = [
  'executive',
  'department_manager',
  'auditor',
  'hr',
  'employee',
]

export function isSupportedCockpitRole(role: string): role is CockpitRole {
  return SUPPORTED_ROLES.includes(role as CockpitRole)
}

export async function fetchRoleCockpit(role: CockpitRole): Promise<RoleCockpit> {
  await randomDelay()
  if (!isSupportedCockpitRole(role)) {
    throw new ApiError('Unsupported cockpit role', 400)
  }
  return roleCockpitStore.getCockpit(role)
}

export async function fetchCockpitSection(
  role: CockpitRole,
  section: CockpitWidgetSection,
): Promise<RoleCockpit[CockpitWidgetSection]> {
  await randomDelay()
  try {
    return roleCockpitStore.getSection(role, section)
  } catch (e) {
    throw new ApiError(e instanceof Error ? e.message : 'Widget load failed', 500)
  }
}

export async function fetchDrillDown(
  request: DrillDownRequest,
): Promise<{ nodes: DrillDownNode[]; title: string }> {
  await randomDelay()
  const nodes = cockpitDrillDownStore.getLevel(request)
  const title = cockpitDrillDownStore.getRootLabel(request)
  return { nodes, title }
}
