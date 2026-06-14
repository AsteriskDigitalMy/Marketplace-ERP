import { randomDelay } from '@/lib/api/delay'
import { ApiError } from '@/lib/api/errors'
import type { SystemRole, UserAccount } from '@/models/pms/identity'
import { UserAccountCreateRequestSchema } from '@/models/pms/identity'
import { parseModel } from '@/models/common/parse'
import { pmsStore, type BulkImportResult } from '@/mocks/pms/store'

export async function fetchRoles(): Promise<SystemRole[]> {
  await randomDelay()
  return pmsStore.getRoles()
}

export async function fetchRole(id: string): Promise<SystemRole> {
  await randomDelay()
  const role = pmsStore.getRoleById(id)
  if (!role) {
    throw new ApiError('Role not found', 404)
  }
  return role
}

export async function saveRole(
  input: Pick<
    SystemRole,
    'Name' | 'Remarks' | 'MenuPermissions' | 'ButtonPermissions' | 'DataScope' | 'CustomFilter'
  >,
  id?: string,
): Promise<SystemRole> {
  await randomDelay()
  try {
    if (id) {
      return pmsStore.updateRole(id, input)
    }
    return pmsStore.createRole(input)
  } catch (error) {
    throw new ApiError(error instanceof Error ? error.message : 'Save failed', 400)
  }
}

export async function deleteRole(id: string): Promise<void> {
  await randomDelay()
  try {
    pmsStore.deleteRole(id)
  } catch (error) {
    throw new ApiError(error instanceof Error ? error.message : 'Delete failed', 400)
  }
}

export async function fetchAccounts(): Promise<UserAccount[]> {
  await randomDelay()
  return pmsStore.getAccounts()
}

export async function fetchAccount(id: string): Promise<UserAccount> {
  await randomDelay()
  const account = pmsStore.getAccountById(id)
  if (!account) {
    throw new ApiError('Account not found', 404)
  }
  return account
}

export async function createAccount(input: {
  EmployeeName: string
  EmployeeId: string
  DepartmentId: string
  Position: string
  InitialPassword: string
  RoleIds: string[]
}): Promise<{ account: UserAccount; generatedPassword: string }> {
  await randomDelay()
  parseModel(UserAccountCreateRequestSchema, {
    ...input,
    OrganizationId: '00000000-0000-0000-0000-000000000001',
    CreatedBy: '00000000-0000-0000-0000-000000000010',
  })
  try {
    return pmsStore.createAccount(input)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Create failed'
    throw new ApiError(message, 400, message.includes('Employee') ? { EmployeeId: message } : {})
  }
}

export async function bulkImportAccounts(
  rows: {
    EmployeeName: string
    EmployeeId: string
    DepartmentId: string
    Position: string
    RoleIds: string[]
  }[],
): Promise<BulkImportResult[]> {
  await randomDelay(600, 1200)
  return pmsStore.bulkImportAccounts(rows)
}

export async function updateAccount(
  id: string,
  input: { EmployeeName: string; DepartmentId: string; Position: string },
): Promise<UserAccount> {
  await randomDelay()
  try {
    return pmsStore.updateAccount(id, input)
  } catch (error) {
    throw new ApiError(error instanceof Error ? error.message : 'Update failed', 400)
  }
}

export async function setAccountStatus(
  id: string,
  status: UserAccount['Status'],
): Promise<UserAccount> {
  await randomDelay()
  return pmsStore.setAccountStatus(id, status)
}

export async function resetAccountPassword(id: string): Promise<string> {
  await randomDelay()
  return pmsStore.resetAccountPassword(id)
}

export async function bindUserRoles(userId: string, roleIds: string[]): Promise<UserAccount> {
  await randomDelay()
  try {
    return pmsStore.bindUserRoles(userId, roleIds)
  } catch (error) {
    throw new ApiError(error instanceof Error ? error.message : 'Bind failed', 400)
  }
}
