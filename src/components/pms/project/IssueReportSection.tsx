import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import type { ProjectIssue } from '@/models/pms/project'

export interface IssueReportValues {
  enabled: boolean
  Description: string
  ResourceType: ProjectIssue['ResourceType']
  FlagAtRisk: boolean
}

interface IssueReportSectionProps {
  value: IssueReportValues
  onChange: (value: IssueReportValues) => void
}

export function IssueReportSection({ value, onChange }: IssueReportSectionProps) {
  const [open, setOpen] = useState(value.enabled)

  const set = (patch: Partial<IssueReportValues>) => {
    const next = { ...value, ...patch }
    if (patch.Description !== undefined && patch.Description && !value.enabled) {
      next.FlagAtRisk = true
    }
    onChange(next)
  }

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          const next = !open
          setOpen(next)
          set({ enabled: next })
        }}
      >
        {open ? 'Hide issue report' : 'Report execution issue'}
      </Button>
      {open ? (
        <div className="space-y-3 rounded-md border p-4">
          <Alert>
            <AlertDescription>
              Issues are routed to the project leader for assignment and closed-loop handling.
            </AlertDescription>
          </Alert>
          <div className="space-y-2">
            <Label htmlFor="issue-desc">Issue description</Label>
            <Textarea
              id="issue-desc"
              rows={3}
              maxLength={2000}
              value={value.Description}
              onChange={(e) =>
                set({
                  Description: e.target.value,
                  FlagAtRisk: e.target.value ? true : value.FlagAtRisk,
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Required resource type</Label>
            <Select
              value={value.ResourceType}
              onValueChange={(v) =>
                set({ ResourceType: v as ProjectIssue['ResourceType'] })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select resource type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="personnel">Personnel</SelectItem>
                <SelectItem value="equipment">Equipment</SelectItem>
                <SelectItem value="material">Material</SelectItem>
                <SelectItem value="budget">Budget</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={value.FlagAtRisk}
              onCheckedChange={(c) => set({ FlagAtRisk: c === true })}
            />
            Flag task at risk
          </label>
          {value.FlagAtRisk ? <Badge variant="destructive">At risk</Badge> : null}
        </div>
      ) : null}
    </div>
  )
}
