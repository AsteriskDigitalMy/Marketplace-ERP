import type { OrgUnit, OrgVersion } from '@/models/pms/organization'
import type { SystemRole, UserAccount } from '@/models/pms/identity'
import type { DictionaryCategory, OperationLog, SystemParameter } from '@/models/pms/configuration'
import {
  MOCK_ADMIN_USER_ID,
  MOCK_ORGANIZATION_ID,
} from '@/lib/pms/constants'

export interface ParameterChangeLogEntry {
  At: string
  Actor: string
  OldValue: string
  NewValue: string
}

export interface SystemParameterRecord extends SystemParameter {
  ChangeLog: ParameterChangeLogEntry[]
}

export interface OrgUnitEditMeta {
  HasActiveWorkflows: boolean
  ChildCount: number
  ChangeHistory: { Version: number; ChangedAt: string; ChangedBy: string; Summary: string }[]
}

export interface BulkImportResult {
  Row: number
  EmployeeId: string
  Status: 'success' | 'failed'
  Error: string | null
}

function nowIso(): string {
  return new Date().toISOString()
}

function newId(): string {
  return crypto.randomUUID()
}

function auditFields() {
  const ts = nowIso()
  return {
    OrganizationId: MOCK_ORGANIZATION_ID,
    CreatedBy: MOCK_ADMIN_USER_ID,
    CreatedDatetime: ts,
    ModifiedBy: MOCK_ADMIN_USER_ID,
    ModifiedDatetime: ts,
  }
}

const orgUnits: OrgUnit[] = [
  {
    Id: '10000000-0000-0000-0000-000000000001',
    ParentId: null,
    Code: 'ORG-CO-001',
    Name: 'Asterisk Leather Group',
    TierType: 'company',
    ProcessTag: null,
    SortOrder: 0,
    IsDisabled: false,
    ...auditFields(),
  },
  {
    Id: '10000000-0000-0000-0000-000000000002',
    ParentId: '10000000-0000-0000-0000-000000000001',
    Code: 'ORG-PL-001',
    Name: 'Selangor Plant',
    TierType: 'plant',
    ProcessTag: null,
    SortOrder: 0,
    IsDisabled: false,
    ...auditFields(),
  },
  {
    Id: '10000000-0000-0000-0000-000000000003',
    ParentId: '10000000-0000-0000-0000-000000000002',
    Code: 'ORG-DP-001',
    Name: 'Production Department',
    TierType: 'department',
    ProcessTag: null,
    SortOrder: 0,
    IsDisabled: false,
    ...auditFields(),
  },
  {
    Id: '10000000-0000-0000-0000-000000000004',
    ParentId: '10000000-0000-0000-0000-000000000003',
    Code: 'ORG-WS-001',
    Name: 'Cutting Workshop',
    TierType: 'workshop',
    ProcessTag: null,
    SortOrder: 0,
    IsDisabled: false,
    ...auditFields(),
  },
]

const orgVersions: OrgVersion[] = []
const orgEditMeta: Record<string, OrgUnitEditMeta> = {}

const roles: SystemRole[] = [
  {
    Id: '20000000-0000-0000-0000-000000000001',
    Name: 'System Administrator',
    Remarks: 'Full PMS admin access',
    MenuPermissions: ['pms.admin', 'pms.kpi', 'pms.projects'],
    ButtonPermissions: {
      'pms.admin': ['view', 'add', 'edit', 'delete', 'approve', 'export'],
    },
    DataScope: 'company',
    CustomFilter: null,
    BoundUserCount: 1,
    ...auditFields(),
  },
  {
    Id: '20000000-0000-0000-0000-000000000002',
    Name: 'Auditor',
    Remarks: 'Review and audit workflows',
    MenuPermissions: ['pms.appraisal', 'pms.alerts'],
    ButtonPermissions: {
      'pms.appraisal': ['view', 'approve', 'export'],
    },
    DataScope: 'company',
    CustomFilter: null,
    BoundUserCount: 0,
    ...auditFields(),
  },
]

const accounts: UserAccount[] = [
  {
    Id: MOCK_ADMIN_USER_ID,
    LoginAccount: 'admin@marketplace-erp.local',
    EmployeeId: 'EMP-0001',
    EmployeeName: 'System Administrator',
    DepartmentId: '10000000-0000-0000-0000-000000000003',
    Position: 'IT Administrator',
    Status: 'active',
    RoleIds: ['20000000-0000-0000-0000-000000000001'],
    LastLoginAt: nowIso(),
    ...auditFields(),
  },
]

const dictionaries: DictionaryCategory[] = [
  {
    OrganizationId: MOCK_ORGANIZATION_ID,
    Code: 'production_process',
    Name: 'Production Processes',
    IsBuiltin: true,
    Items: [
      { Code: 'CUT', DisplayName: 'Cutting', SortOrder: 0, IsEnabled: true },
      { Code: 'SEW', DisplayName: 'Sewing', SortOrder: 1, IsEnabled: true },
      { Code: 'FIN', DisplayName: 'Finishing', SortOrder: 2, IsEnabled: true },
    ],
  },
  {
    OrganizationId: MOCK_ORGANIZATION_ID,
    Code: 'project_type',
    Name: 'Project Types',
    IsBuiltin: false,
    Items: [
      { Code: 'KPI', DisplayName: 'KPI Initiative', SortOrder: 0, IsEnabled: true },
      { Code: 'CAP', DisplayName: 'Capacity Project', SortOrder: 1, IsEnabled: true },
    ],
  },
]

const operationLogs: OperationLog[] = [
  {
    Id: newId(),
    OrganizationId: MOCK_ORGANIZATION_ID,
    OperatorAccount: 'admin@marketplace-erp.local',
    OperatedAt: nowIso(),
    BusinessType: 'org',
    TargetLabel: 'Asterisk Leather Group',
    Action: 'VIEW',
    LoginIp: '192.168.1.10',
    BeforeData: null,
    AfterData: null,
  },
]

const parameters: SystemParameterRecord[] = [
  {
    Code: 'KPI_CALC_CRON',
    Name: 'KPI Batch Calculation Schedule',
    Category: 'KPI',
    DataType: 'string',
    Value: '0 2 * * *',
    EffectiveAt: nowIso(),
    IsCore: true,
    ChangeLog: [],
    ...auditFields(),
  },
  {
    Code: 'SESSION_TIMEOUT_MIN',
    Name: 'Session Timeout (minutes)',
    Category: 'Security',
    DataType: 'number',
    Value: 30,
    EffectiveAt: nowIso(),
    IsCore: false,
    ChangeLog: [],
    ...auditFields(),
  },
]

let orgCodeCounter = 5

function appendLog(
  businessType: string,
  targetLabel: string,
  action: string,
  before: Record<string, unknown> | null,
  after: Record<string, unknown> | null,
): void {
  operationLogs.unshift({
    Id: newId(),
    OrganizationId: MOCK_ORGANIZATION_ID,
    OperatorAccount: 'admin@marketplace-erp.local',
    OperatedAt: nowIso(),
    BusinessType: businessType,
    TargetLabel: targetLabel,
    Action: action,
    LoginIp: '192.168.1.10',
    BeforeData: before,
    AfterData: after,
  })
}

function getDescendantIds(parentId: string): string[] {
  const children = orgUnits.filter((u) => u.ParentId === parentId)
  return children.flatMap((c) => [c.Id, ...getDescendantIds(c.Id)])
}

function snapshotOrgTree(): OrgUnit[] {
  return orgUnits.map((u) => ({ ...u }))
}

export const pmsStore = {
  getOrgUnits(): OrgUnit[] {
    return orgUnits.map((u) => ({ ...u }))
  },

  getOrgUnitById(id: string): OrgUnit | undefined {
    return orgUnits.find((u) => u.Id === id)
  },

  getSiblingNames(parentId: string | null, excludeId?: string): string[] {
    return orgUnits
      .filter((u) => u.ParentId === parentId && u.Id !== excludeId)
      .map((u) => u.Name.toLowerCase())
  },

  createOrgUnit(input: {
    ParentId: string | null
    Name: string
    TierType: OrgUnit['TierType']
    ProcessTag: string | null
    SortOrder: number
  }): OrgUnit {
    const parent = input.ParentId ? orgUnits.find((u) => u.Id === input.ParentId) : null
    if (parent?.IsDisabled) {
      throw new Error('Cannot add children under a disabled unit')
    }
    if (
      pmsStore.getSiblingNames(input.ParentId).includes(input.Name.toLowerCase())
    ) {
      throw new Error('Organization name must be unique among siblings')
    }

    const unit: OrgUnit = {
      Id: newId(),
      ParentId: input.ParentId,
      Code: `ORG-${input.TierType.slice(0, 2).toUpperCase()}-${String(orgCodeCounter++).padStart(3, '0')}`,
      Name: input.Name,
      TierType: input.TierType,
      ProcessTag: input.ProcessTag,
      SortOrder: input.SortOrder,
      IsDisabled: false,
      ...auditFields(),
    }
    orgUnits.push(unit)
    appendLog('org', unit.Name, 'CREATE', null, { ...unit })
    return { ...unit }
  },

  updateOrgUnit(
    id: string,
    input: {
      Name: string
      TierType: OrgUnit['TierType']
      ProcessTag: string | null
      SortOrder: number
    },
  ): OrgUnit {
    const index = orgUnits.findIndex((u) => u.Id === id)
    if (index === -1) {
      throw new Error('Organization unit not found')
    }
    const current = orgUnits[index]
    if (
      pmsStore.getSiblingNames(current.ParentId, id).includes(input.Name.toLowerCase())
    ) {
      throw new Error('Organization name must be unique among siblings')
    }
    const before = { ...current }
    const updated: OrgUnit = {
      ...current,
      Name: input.Name,
      TierType: input.TierType,
      ProcessTag: input.ProcessTag,
      SortOrder: input.SortOrder,
      ModifiedBy: MOCK_ADMIN_USER_ID,
      ModifiedDatetime: nowIso(),
    }
    orgUnits[index] = updated

    const history = orgEditMeta[id]?.ChangeHistory ?? []
    orgEditMeta[id] = {
      HasActiveWorkflows: false,
      ChildCount: getDescendantIds(id).length,
      ChangeHistory: [
        {
          Version: history.length + 1,
          ChangedAt: nowIso(),
          ChangedBy: MOCK_ADMIN_USER_ID,
          Summary: `Updated ${input.Name}`,
        },
        ...history,
      ],
    }
    appendLog('org', updated.Name, 'UPDATE', before, updated)
    return { ...updated }
  },

  setOrgUnitDisabled(id: string, disabled: boolean): OrgUnit {
    const index = orgUnits.findIndex((u) => u.Id === id)
    if (index === -1) {
      throw new Error('Organization unit not found')
    }
    const meta = orgEditMeta[id] ?? {
      HasActiveWorkflows: false,
      ChildCount: getDescendantIds(id).length,
      ChangeHistory: [],
    }
    if (disabled && meta.HasActiveWorkflows) {
      throw new Error('Cannot disable: active approval workflows in progress')
    }
    const before = { ...orgUnits[index] }
    orgUnits[index] = {
      ...orgUnits[index],
      IsDisabled: disabled,
      ModifiedBy: MOCK_ADMIN_USER_ID,
      ModifiedDatetime: nowIso(),
    }
    if (disabled) {
      getDescendantIds(id).forEach((childId) => {
        const childIndex = orgUnits.findIndex((u) => u.Id === childId)
        if (childIndex >= 0) {
          orgUnits[childIndex] = {
            ...orgUnits[childIndex],
            IsDisabled: true,
            ModifiedBy: MOCK_ADMIN_USER_ID,
            ModifiedDatetime: nowIso(),
          }
        }
      })
    }
    appendLog('org', orgUnits[index].Name, disabled ? 'DISABLE' : 'ENABLE', before, orgUnits[index])
    return { ...orgUnits[index] }
  },

  getOrgEditMeta(id: string): OrgUnitEditMeta {
    return (
      orgEditMeta[id] ?? {
        HasActiveWorkflows: false,
        ChildCount: getDescendantIds(id).length,
        ChangeHistory: [],
      }
    )
  },

  getOrgVersions(orgUnitId: string): OrgVersion[] {
    return orgVersions
      .filter((v) => v.OrgUnitId === orgUnitId)
      .sort((a, b) => b.Version - a.Version)
  },

  saveOrgVersion(orgUnitId: string, summary: string): OrgVersion {
    const existing = orgVersions.filter((v) => v.OrgUnitId === orgUnitId)
    const version: OrgVersion = {
      Id: newId(),
      OrganizationId: MOCK_ORGANIZATION_ID,
      OrgUnitId: orgUnitId,
      Version: existing.length + 1,
      SnapshotAt: nowIso(),
      ActorId: MOCK_ADMIN_USER_ID,
      Summary: summary,
      TreeSnapshot: snapshotOrgTree(),
    }
    orgVersions.push(version)
    return version
  },

  rollbackOrgVersion(versionId: string): void {
    const version = orgVersions.find((v) => v.Id === versionId)
    if (!version) {
      throw new Error('Version not found')
    }
    orgUnits.length = 0
    version.TreeSnapshot.forEach((u) => orgUnits.push({ ...u }))
    appendLog('org', 'Structure', 'ROLLBACK', null, { versionId })
  },

  getRoles(): SystemRole[] {
    return roles.map((r) => ({ ...r, BoundUserCount: accounts.filter((a) => a.RoleIds.includes(r.Id)).length }))
  },

  getRoleById(id: string): SystemRole | undefined {
    return pmsStore.getRoles().find((r) => r.Id === id)
  },

  createRole(
    input: Pick<SystemRole, 'Name' | 'Remarks' | 'MenuPermissions' | 'ButtonPermissions' | 'DataScope' | 'CustomFilter'>,
  ): SystemRole {
    if (roles.some((r) => r.Name.toLowerCase() === input.Name.toLowerCase())) {
      throw new Error('Role name already exists')
    }
    const role: SystemRole = {
      Id: newId(),
      BoundUserCount: 0,
      ...input,
      ...auditFields(),
    }
    roles.push(role)
    appendLog('role', role.Name, 'CREATE', null, { ...role })
    return { ...role }
  },

  updateRole(id: string, input: Partial<SystemRole>): SystemRole {
    const index = roles.findIndex((r) => r.Id === id)
    if (index === -1) {
      throw new Error('Role not found')
    }
    const before = { ...roles[index] }
    roles[index] = {
      ...roles[index],
      ...input,
      Id: id,
      ModifiedBy: MOCK_ADMIN_USER_ID,
      ModifiedDatetime: nowIso(),
    }
    appendLog('role', roles[index].Name, 'UPDATE', before, roles[index])
    return { ...roles[index], BoundUserCount: accounts.filter((a) => a.RoleIds.includes(id)).length }
  },

  deleteRole(id: string): void {
    const role = roles.find((r) => r.Id === id)
    if (!role) {
      throw new Error('Role not found')
    }
    if (accounts.some((a) => a.RoleIds.includes(id))) {
      throw new Error('Cannot delete role with bound users')
    }
    const index = roles.findIndex((r) => r.Id === id)
    roles.splice(index, 1)
    appendLog('role', role.Name, 'DELETE', role, null)
  },

  getAccounts(): UserAccount[] {
    return accounts.map((a) => ({ ...a }))
  },

  getAccountById(id: string): UserAccount | undefined {
    return accounts.find((a) => a.Id === id)
  },

  employeeIdExists(employeeId: string, excludeId?: string): boolean {
    return accounts.some(
      (a) => a.EmployeeId.toLowerCase() === employeeId.toLowerCase() && a.Id !== excludeId,
    )
  },

  createAccount(input: {
    EmployeeName: string
    EmployeeId: string
    DepartmentId: string
    Position: string
    RoleIds: string[]
  }): { account: UserAccount; generatedPassword: string } {
    if (pmsStore.employeeIdExists(input.EmployeeId)) {
      throw new Error('Employee ID already exists')
    }
    const generatedPassword = `Tmp${Math.random().toString(36).slice(2, 10)}!`
    const loginAccount = `${input.EmployeeId.toLowerCase()}@marketplace-erp.local`
    const account: UserAccount = {
      Id: newId(),
      LoginAccount: loginAccount,
      EmployeeId: input.EmployeeId,
      EmployeeName: input.EmployeeName,
      DepartmentId: input.DepartmentId,
      Position: input.Position,
      Status: 'active',
      RoleIds: input.RoleIds,
      LastLoginAt: null,
      ...auditFields(),
    }
    accounts.push(account)
    appendLog('user', account.EmployeeName, 'CREATE', null, { ...account })
    return { account: { ...account }, generatedPassword }
  },

  bulkImportAccounts(
    rows: { EmployeeName: string; EmployeeId: string; DepartmentId: string; Position: string; RoleIds: string[] }[],
  ): BulkImportResult[] {
    return rows.map((row, index) => {
      try {
        pmsStore.createAccount(row)
        return { Row: index + 1, EmployeeId: row.EmployeeId, Status: 'success' as const, Error: null }
      } catch (error) {
        return {
          Row: index + 1,
          EmployeeId: row.EmployeeId,
          Status: 'failed' as const,
          Error: error instanceof Error ? error.message : 'Import failed',
        }
      }
    })
  },

  updateAccount(
    id: string,
    input: { EmployeeName: string; DepartmentId: string; Position: string },
  ): UserAccount {
    const index = accounts.findIndex((a) => a.Id === id)
    if (index === -1) {
      throw new Error('Account not found')
    }
    const before = { ...accounts[index] }
    accounts[index] = {
      ...accounts[index],
      ...input,
      ModifiedBy: MOCK_ADMIN_USER_ID,
      ModifiedDatetime: nowIso(),
    }
    appendLog('user', accounts[index].EmployeeName, 'UPDATE', before, accounts[index])
    return { ...accounts[index] }
  },

  setAccountStatus(id: string, status: UserAccount['Status']): UserAccount {
    const index = accounts.findIndex((a) => a.Id === id)
    if (index === -1) {
      throw new Error('Account not found')
    }
    const before = { ...accounts[index] }
    accounts[index] = {
      ...accounts[index],
      Status: status,
      ModifiedBy: MOCK_ADMIN_USER_ID,
      ModifiedDatetime: nowIso(),
    }
    appendLog('user', accounts[index].EmployeeName, status === 'active' ? 'ACTIVATE' : 'DISABLE', before, accounts[index])
    return { ...accounts[index] }
  },

  resetAccountPassword(id: string): string {
    const account = accounts.find((a) => a.Id === id)
    if (!account) {
      throw new Error('Account not found')
    }
    const password = `Reset${Math.random().toString(36).slice(2, 10)}!`
    appendLog('user', account.EmployeeName, 'PASSWORD_RESET', null, { Id: id })
    return password
  },

  bindUserRoles(userId: string, roleIds: string[]): UserAccount {
    const index = accounts.findIndex((a) => a.Id === userId)
    if (index === -1) {
      throw new Error('Account not found')
    }
    if (roleIds.length === 0) {
      throw new Error('At least one role required')
    }
    const before = { ...accounts[index] }
    accounts[index] = {
      ...accounts[index],
      RoleIds: roleIds,
      ModifiedBy: MOCK_ADMIN_USER_ID,
      ModifiedDatetime: nowIso(),
    }
    appendLog('user', accounts[index].EmployeeName, 'ROLE_BIND', before, accounts[index])
    return { ...accounts[index] }
  },

  getDictionaries(): DictionaryCategory[] {
    return dictionaries.map((d) => ({ ...d, Items: d.Items.map((i) => ({ ...i })) }))
  },

  updateDictionary(categoryCode: string, items: DictionaryCategory['Items']): DictionaryCategory {
    const index = dictionaries.findIndex((d) => d.Code === categoryCode)
    if (index === -1) {
      throw new Error('Dictionary category not found')
    }
    const before = { ...dictionaries[index] }
    dictionaries[index] = { ...dictionaries[index], Items: items }
    appendLog('dictionary', dictionaries[index].Name, 'UPDATE', before, dictionaries[index])
    return { ...dictionaries[index], Items: items.map((i) => ({ ...i })) }
  },

  getProcessTags(): { Code: string; DisplayName: string }[] {
    const cat = dictionaries.find((d) => d.Code === 'production_process')
    return (cat?.Items ?? []).filter((i) => i.IsEnabled).map((i) => ({ Code: i.Code, DisplayName: i.DisplayName }))
  },

  getOperationLogs(filters: {
    operator?: string
    businessType?: string
    from?: string
    to?: string
    ip?: string
  }): OperationLog[] {
    return operationLogs.filter((log) => {
      if (filters.operator && !log.OperatorAccount.toLowerCase().includes(filters.operator.toLowerCase())) {
        return false
      }
      if (filters.businessType && log.BusinessType !== filters.businessType) {
        return false
      }
      if (filters.ip && !log.LoginIp.includes(filters.ip)) {
        return false
      }
      if (filters.from && log.OperatedAt < filters.from) {
        return false
      }
      if (filters.to && log.OperatedAt > filters.to) {
        return false
      }
      return true
    })
  },

  getOperationLogById(id: string): OperationLog | undefined {
    return operationLogs.find((l) => l.Id === id)
  },

  getParameters(): SystemParameterRecord[] {
    return parameters.map((p) => ({ ...p, ChangeLog: [...p.ChangeLog] }))
  },

  updateParameter(
    code: string,
    value: string | number | boolean,
    effectiveAt: string,
  ): SystemParameterRecord {
    const index = parameters.findIndex((p) => p.Code === code)
    if (index === -1) {
      throw new Error('Parameter not found')
    }
    const before = parameters[index]
    const oldValue = String(before.Value)
    parameters[index] = {
      ...before,
      Value: value,
      EffectiveAt: effectiveAt,
      ModifiedBy: MOCK_ADMIN_USER_ID,
      ModifiedDatetime: nowIso(),
      ChangeLog: [
        {
          At: nowIso(),
          Actor: 'admin@marketplace-erp.local',
          OldValue: oldValue,
          NewValue: String(value),
        },
        ...before.ChangeLog,
      ],
    }
    appendLog('parameter', code, 'UPDATE', { Value: oldValue }, { Value: value })
    return { ...parameters[index], ChangeLog: [...parameters[index].ChangeLog] }
  },

  getActiveOrgUnits(): OrgUnit[] {
    return orgUnits.filter((u) => !u.IsDisabled)
  },
}

export type { OrgUnit, OrgVersion, SystemRole, UserAccount, DictionaryCategory, OperationLog }
