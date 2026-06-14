import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { MOCK_ADMIN_USER_ID } from '@/lib/pms/constants'

export type PmsPermission =
  | 'org.manage'
  | 'user.manage'
  | 'role.manage'
  | 'dictionary.manage'
  | 'audit.read'
  | 'parameter.manage'
  | 'kpi.manage'
  | 'kpi.calculate'
  | 'project.initiate'
  | 'project.approve'
  | 'project.manage'
  | 'acceptance.approve'
  | 'data.manage'
  | 'data.review'

interface PmsAuthContextValue {
  userId: string
  displayName: string
  loginAccount: string
  permissions: PmsPermission[]
  hasPermission: (permission: PmsPermission) => boolean
}

const PmsAuthContext = createContext<PmsAuthContextValue | null>(null)

const ADMIN_PERMISSIONS: PmsPermission[] = [
  'org.manage',
  'user.manage',
  'role.manage',
  'dictionary.manage',
  'audit.read',
  'parameter.manage',
  'kpi.manage',
  'kpi.calculate',
  'project.initiate',
  'project.approve',
  'project.manage',
  'acceptance.approve',
  'data.manage',
  'data.review',
]

export function PmsAuthProvider({ children }: { children: ReactNode }) {
  const value = useMemo<PmsAuthContextValue>(
    () => ({
      userId: MOCK_ADMIN_USER_ID,
      displayName: 'System Administrator',
      loginAccount: 'admin@marketplace-erp.local',
      permissions: ADMIN_PERMISSIONS,
      hasPermission: (permission) => ADMIN_PERMISSIONS.includes(permission),
    }),
    [],
  )

  return <PmsAuthContext.Provider value={value}>{children}</PmsAuthContext.Provider>
}

export function usePmsAuth(): PmsAuthContextValue {
  const ctx = useContext(PmsAuthContext)
  if (!ctx) {
    throw new Error('usePmsAuth must be used within PmsAuthProvider')
  }
  return ctx
}
