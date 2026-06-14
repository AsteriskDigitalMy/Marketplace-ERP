import { randomDelay } from '@/lib/api/delay'
import { ApiError } from '@/lib/api/errors'
import { validateGradeRules } from '@/lib/pms/appraisal-helpers'
import { MOCK_ORGANIZATION_ID } from '@/lib/pms/constants'
import type { AppraisalScheme } from '@/models/pms/operations'
import { AppraisalSchemeSchema } from '@/models/pms/operations'
import { appraisalSchemesStore } from '@/mocks/pms/appraisal-schemes-store'
import { kpiStore } from '@/mocks/pms/kpi-store'

export type AppraisalSchemeInput = Omit<AppraisalScheme, 'Id' | 'OrganizationId'> & { Id?: string }

export interface AppraisalSchemeFilters {
  status?: AppraisalScheme['Status'] | 'all'
  cycle?: AppraisalScheme['Cycle'] | 'all'
  departmentId?: string
  search?: string
}

export async function fetchAppraisalSchemes(
  filters?: AppraisalSchemeFilters,
): Promise<AppraisalScheme[]> {
  await randomDelay()
  let list = appraisalSchemesStore.list()
  if (filters?.status && filters.status !== 'all') {
    list = list.filter((s) => s.Status === filters.status)
  }
  if (filters?.cycle && filters.cycle !== 'all') {
    list = list.filter((s) => s.Cycle === filters.cycle)
  }
  if (filters?.departmentId) {
    list = list.filter((s) => s.Departments.includes(filters.departmentId!))
  }
  if (filters?.search?.trim()) {
    const q = filters.search.trim().toLowerCase()
    list = list.filter((s) => s.Name.toLowerCase().includes(q))
  }
  return list
}

export async function fetchAppraisalScheme(id: string): Promise<AppraisalScheme> {
  await randomDelay()
  const scheme = appraisalSchemesStore.getById(id)
  if (!scheme) throw new ApiError('Appraisal scheme not found', 404)
  return scheme
}

export async function saveAppraisalScheme(
  input: AppraisalSchemeInput,
  activate = false,
): Promise<AppraisalScheme> {
  await randomDelay()
  const record: AppraisalScheme = {
    ...input,
    Id: input.Id ?? crypto.randomUUID(),
    OrganizationId: MOCK_ORGANIZATION_ID,
    Status: activate ? 'active' : 'draft',
    Departments: input.Departments.length > 0 ? input.Departments : [],
    Roles: input.Roles.length > 0 ? input.Roles : [],
  }

  if (activate) {
    const gradeError = validateGradeRules(input.GradeRules)
    if (gradeError) throw new ApiError(gradeError, 400)
    if (record.Departments.length === 0 || record.Roles.length === 0) {
      throw new ApiError('Select at least one department and role', 400)
    }
    const parsed = AppraisalSchemeSchema.safeParse(record)
    if (!parsed.success) {
      throw new ApiError(parsed.error.issues[0]?.message ?? 'Validation failed', 400)
    }
    const conflicts = appraisalSchemesStore.findConflicts(parsed.data)
    if (conflicts.length > 0) {
      throw new ApiError(
        `Scope conflict with: ${conflicts.map((c) => c.Name).join(', ')}`,
        409,
      )
    }
    return appraisalSchemesStore.save(parsed.data)
  }

  return appraisalSchemesStore.save(record)
}

export async function archiveAppraisalScheme(id: string): Promise<AppraisalScheme> {
  await randomDelay()
  const scheme = appraisalSchemesStore.getById(id)
  if (!scheme) throw new ApiError('Appraisal scheme not found', 404)
  return appraisalSchemesStore.save({ ...scheme, Status: 'archived' })
}

export async function copyAppraisalScheme(id: string): Promise<AppraisalScheme> {
  await randomDelay()
  const source = appraisalSchemesStore.getById(id)
  if (!source) throw new ApiError('Appraisal scheme not found', 404)
  return {
    ...source,
    Id: crypto.randomUUID(),
    Name: `${source.Name} (Copy)`,
    Status: 'draft',
  }
}

export async function fetchKpiLibraryForPicker(excludeIds: string[] = []) {
  await randomDelay()
  return kpiStore
    .getIndicators()
    .filter((k) => k.Status === 'enabled' && !excludeIds.includes(k.Id))
    .map((k) => ({
      Id: k.Id,
      Code: k.Code,
      Name: k.Name,
      Category: k.Category,
    }))
}

export function findSchemeConflicts(scheme: AppraisalScheme): AppraisalScheme[] {
  return appraisalSchemesStore.findConflicts({ ...scheme, Status: 'active' })
}
