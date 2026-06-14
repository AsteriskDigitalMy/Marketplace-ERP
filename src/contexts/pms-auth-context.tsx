import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { CockpitRole } from '@/models/common/enums'
import { MOCK_ADMIN_USER_ID } from '@/lib/pms/constants'

export type PmsPermission =
  | 'org.manage'
  | 'user.manage'
  | 'role.manage'
  | 'dictionary.manage'
  | 'audit.read'
  | 'parameter.manage'
  | 'settings.manage'
  | 'kpi.manage'
  | 'kpi.calculate'
  | 'cockpit.view'
  | 'project.initiate'
  | 'project.approve'
  | 'project.manage'
  | 'acceptance.approve'
  | 'data.manage'
  | 'data.review'
  | 'alerts.manage'
  | 'alerts.view'
  | 'appraisal.manage'
  | 'appraisal.review'
  | 'appraisal.hr'
  | 'appraisal.final'
  | 'pdca.submit'
  | 'pdca.manage'
  | 'reports.view'

interface PmsAuthContextValue {
  userId: string
  displayName: string
  loginAccount: string
  permissions: PmsPermission[]
  cockpitRole: CockpitRole
  setCockpitRole: (role: CockpitRole) => void
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
  'settings.manage',
  'kpi.manage',
  'kpi.calculate',
  'cockpit.view',
  'project.initiate',
  'project.approve',
  'project.manage',
  'acceptance.approve',
  'data.manage',
  'data.review',
  'alerts.manage',
  'alerts.view',
  'appraisal.manage',
  'appraisal.review',
  'appraisal.hr',
  'appraisal.final',
  'pdca.submit',
  'pdca.manage',
  'reports.view',
]

export function PmsAuthProvider({ children }: { children: ReactNode }) {
  const [cockpitRole, setCockpitRole] = useState<CockpitRole>('executive')

  const value = useMemo<PmsAuthContextValue>(
    () => ({
      userId: MOCK_ADMIN_USER_ID,
      displayName: 'System Administrator',
      loginAccount: 'admin@marketplace-erp.local',
      permissions: ADMIN_PERMISSIONS,
      cockpitRole,
      setCockpitRole,
      hasPermission: (permission) => ADMIN_PERMISSIONS.includes(permission),
    }),
    [cockpitRole],
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
