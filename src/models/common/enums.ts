import { z } from 'zod'

export const OrgTierTypeSchema = z.enum([
  'company',
  'plant',
  'department',
  'workshop',
  'line',
  'process',
  'shift',
])

export const AccountStatusSchema = z.enum(['active', 'disabled'])

export const DataScopeSchema = z.enum(['company', 'department', 'individual', 'custom'])

export const ButtonPermissionSchema = z.enum([
  'view',
  'add',
  'edit',
  'delete',
  'approve',
  'export',
])

export const KpiCycleSchema = z.enum([
  'daily',
  'weekly',
  'monthly',
  'quarterly',
  'annual',
])

export const KpiEvaluationObjectSchema = z.enum(['department', 'individual', 'project'])

export const KpiDataSourceSchema = z.enum(['auto', 'manual', 'mixed'])

export const KpiIndicatorStatusSchema = z.enum(['enabled', 'disabled'])

export const PerformanceGradeSchema = z.enum(['A', 'B', 'C', 'D'])

export const TrafficLightColorSchema = z.enum(['green', 'yellow', 'red'])

export const TrafficLightCategorySchema = z.enum(['progress', 'delay', 'performance'])

export const CockpitRoleSchema = z.enum([
  'executive',
  'department_manager',
  'auditor',
  'hr',
  'employee',
])

export const CockpitChartTypeSchema = z.enum(['bar', 'line', 'donut'])

export const AlertLevelSchema = z.enum(['general', 'important', 'urgent'])

export const AlertChannelSchema = z.enum(['in_app', 'sms', 'email'])

export const ProjectStatusSchema = z.enum([
  'draft',
  'pending_approval',
  'returned',
  'in_progress',
  'pending_acceptance',
  'archived',
])

export const TaskStatusSchema = z.enum([
  'not_started',
  'in_progress',
  'completed',
  'blocked',
  'overdue',
])

export const EntityStatusDraftSchema = z.enum(['draft', 'active', 'archived'])

export const SyncStatusSchema = z.enum(['pending', 'synced', 'failed', 'retrying'])

export const WorkOrderStatusSchema = z.enum([
  'draft',
  'released',
  'in_progress',
  'completed',
  'closed',
  'cancelled',
])

export const ApprovalDecisionSchema = z.enum(['approve', 'reject', 'pass', 'fail'])

export type OrgTierType = z.infer<typeof OrgTierTypeSchema>
export type DataScope = z.infer<typeof DataScopeSchema>
export type AccountStatus = z.infer<typeof AccountStatusSchema>
export type KpiCycle = z.infer<typeof KpiCycleSchema>
export type PerformanceGrade = z.infer<typeof PerformanceGradeSchema>
export type TrafficLightColor = z.infer<typeof TrafficLightColorSchema>
export type TrafficLightCategory = z.infer<typeof TrafficLightCategorySchema>
export type CockpitRole = z.infer<typeof CockpitRoleSchema>
export type ProjectStatus = z.infer<typeof ProjectStatusSchema>
export type TaskStatus = z.infer<typeof TaskStatusSchema>
