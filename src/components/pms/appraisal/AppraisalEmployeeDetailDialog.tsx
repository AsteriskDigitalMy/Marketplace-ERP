import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { AppraisalGradeBadge } from '@/components/pms/appraisal/AppraisalGradeBadge'
import type { AppraisalEmployeeRecord } from '@/models/pms/operations'

interface AppraisalEmployeeDetailDialogProps {
  record: AppraisalEmployeeRecord | null
  onOpenChange: (open: boolean) => void
}

export function AppraisalEmployeeDetailDialog({
  record,
  onOpenChange,
}: AppraisalEmployeeDetailDialogProps) {
  return (
    <Dialog open={!!record} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{record?.EmployeeName}</DialogTitle>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="text-muted-foreground">{record?.EmployeeId}</span>
            <span>{record?.Department}</span>
            <span>{record?.Role}</span>
            <span className="text-lg font-semibold">Score: {record?.TotalScore}</span>
            {record ? <AppraisalGradeBadge grade={record.AutoGrade} /> : null}
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>KPI</TableHead>
                <TableHead>Raw</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead>Contribution</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {record?.IndicatorDetails.map((d) => (
                <TableRow key={d.KpiId}>
                  <TableCell>{d.KpiName}</TableCell>
                  <TableCell>{d.RawScore}</TableCell>
                  <TableCell>{d.WeightPct}%</TableCell>
                  <TableCell>{d.WeightedContribution}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogBody>
        <DialogFooter>
          <Button variant="light" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
