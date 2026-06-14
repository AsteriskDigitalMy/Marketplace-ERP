import { randomDelay } from '@/lib/api/delay'
import { ApiError } from '@/lib/api/errors'
import { MOCK_ADMIN_USER_ID, MOCK_ORGANIZATION_ID } from '@/lib/pms/constants'
import { getAllowedChildTiers } from '@/lib/pms/org-tier-rules'
import type { OrgTierType } from '@/models/common/enums'
import type { OrgUnit, OrgVersion } from '@/models/pms/organization'
import { OrgUnitSchema } from '@/models/pms/organization'
import { parseModel } from '@/models/common/parse'
import { pmsStore, type OrgUnitEditMeta } from '@/mocks/pms/store'

export interface OrgUnitTreeNode extends OrgUnit {
  Children: OrgUnitTreeNode[]
}

function buildTree(units: OrgUnit[], parentId: string | null = null): OrgUnitTreeNode[] {
  return units
    .filter((u) => u.ParentId === parentId)
    .sort((a, b) => a.SortOrder - b.SortOrder || a.Name.localeCompare(b.Name))
    .map((unit) => ({
      ...unit,
      Children: buildTree(units, unit.Id),
    }))
}

export async function fetchOrgTree(): Promise<OrgUnitTreeNode[]> {
  await randomDelay()
  return buildTree(pmsStore.getOrgUnits())
}

export async function createOrgUnit(input: {
  ParentId: string | null
  Name: string
  TierType: OrgTierType
  ProcessTag: string | null
  SortOrder: number
}): Promise<OrgUnit> {
  await randomDelay()
  try {
    const parent = input.ParentId ? pmsStore.getOrgUnitById(input.ParentId) : null
    if (parent?.IsDisabled) {
      throw new ApiError('Cannot add children under a disabled unit', 400)
    }
    const allowed = getAllowedChildTiers(parent?.TierType ?? null)
    if (!allowed.includes(input.TierType)) {
      throw new ApiError(`Invalid tier type for selected parent`, 400, {
        TierType: `Allowed: ${allowed.join(', ')}`,
      })
    }
    const unit = pmsStore.createOrgUnit(input)
    return parseModel(
      OrgUnitSchema,
      {
        ...unit,
        ProcessTag: input.TierType === 'process' ? input.ProcessTag : null,
      },
    )
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    const message = error instanceof Error ? error.message : 'Create failed'
    if (message.includes('unique')) {
      throw new ApiError(message, 400, { Name: message })
    }
    throw new ApiError(message, 400)
  }
}

export async function fetchOrgUnit(id: string): Promise<OrgUnit> {
  await randomDelay()
  const unit = pmsStore.getOrgUnitById(id)
  if (!unit) {
    throw new ApiError('Organization unit not found', 404)
  }
  return unit
}

export async function updateOrgUnit(
  id: string,
  input: {
    Name: string
    TierType: OrgTierType
    ProcessTag: string | null
    SortOrder: number
  },
): Promise<OrgUnit> {
  await randomDelay()
  try {
    const unit = pmsStore.updateOrgUnit(id, input)
    pmsStore.saveOrgVersion(id, `Updated ${unit.Name}`)
    return unit
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Update failed'
    if (message.includes('unique')) {
      throw new ApiError(message, 400, { Name: message })
    }
    throw new ApiError(message, 400)
  }
}

export async function setOrgUnitDisabled(id: string, disabled: boolean): Promise<OrgUnit> {
  await randomDelay()
  try {
    return pmsStore.setOrgUnitDisabled(id, disabled)
  } catch (error) {
    throw new ApiError(error instanceof Error ? error.message : 'Operation failed', 400)
  }
}

export async function fetchOrgEditMeta(id: string): Promise<OrgUnitEditMeta> {
  await randomDelay(200, 400)
  return pmsStore.getOrgEditMeta(id)
}

export async function fetchOrgVersions(orgUnitId: string): Promise<OrgVersion[]> {
  await randomDelay()
  return pmsStore.getOrgVersions(orgUnitId)
}

export async function rollbackOrgVersion(versionId: string): Promise<void> {
  await randomDelay(500, 900)
  try {
    pmsStore.rollbackOrgVersion(versionId)
    pmsStore.saveOrgVersion(versionId, 'Rolled back structure')
  } catch (error) {
    throw new ApiError(error instanceof Error ? error.message : 'Rollback failed', 400)
  }
}

export async function fetchProcessTags(): Promise<{ Code: string; DisplayName: string }[]> {
  await randomDelay(150, 300)
  return pmsStore.getProcessTags()
}

export function validateSiblingName(
  parentId: string | null,
  name: string,
  excludeId?: string,
): boolean {
  return !pmsStore.getSiblingNames(parentId, excludeId).includes(name.trim().toLowerCase())
}

export async function createOrgUnitPayload() {
  return {
    OrganizationId: MOCK_ORGANIZATION_ID,
    CreatedBy: MOCK_ADMIN_USER_ID,
    CreatedDatetime: new Date().toISOString(),
  }
}
