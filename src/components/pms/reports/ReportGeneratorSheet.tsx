import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { SubmitSpinner } from '@/components/pms/AsyncState'
import {
  defaultPeriodValue,
  isFuturePeriod,
  QUARTERLY_APPRAISAL_REPORT_ID,
  REPORT_CYCLE_LABELS,
  REPORT_OUTPUT_FORMATS,
  type ReportOutputFormat,
} from '@/lib/pms/report-helpers'
import type { ReportCatalogItem, ReportCycle } from '@/models/pms/operations'
import {
  checkReportReadiness,
  type ReportReadinessResult,
} from '@/services/pms/reports/report-center-service'

interface ReportGeneratorSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  report: ReportCatalogItem | null
  generating: boolean
  onGenerate: (input: {
    cycle: ReportCycle
    periodValue: string
    format: ReportOutputFormat
  }) => void
}

export function ReportGeneratorSheet({
  open,
  onOpenChange,
  report,
  generating,
  onGenerate,
}: ReportGeneratorSheetProps) {
  const [cycle, setCycle] = useState<ReportCycle>('monthly')
  const [periodValue, setPeriodValue] = useState(defaultPeriodValue('monthly'))
  const [format, setFormat] = useState<ReportOutputFormat>('preview')
  const [readiness, setReadiness] = useState<ReportReadinessResult | null>(null)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    if (!report || !open) return
    setCycle(report.SupportedCycles[0])
    setPeriodValue(defaultPeriodValue(report.SupportedCycles[0]))
    setFormat('preview')
  }, [report?.Id, open])

  useEffect(() => {
    if (!report || !open) return
    setChecking(true)
    const timer = setTimeout(() => {
      void checkReportReadiness(report.Id, cycle, periodValue)
        .then(setReadiness)
        .finally(() => setChecking(false))
    }, 250)
    return () => clearTimeout(timer)
  }, [report?.Id, cycle, periodValue, open])

  const futurePeriod = isFuturePeriod(cycle, periodValue)
  const canGenerate =
    !!report &&
    !generating &&
    !checking &&
    readiness?.ready &&
    !futurePeriod

  const periodInput = () => {
    switch (cycle) {
      case 'daily':
        return (
          <Input
            type="date"
            value={periodValue}
            onChange={(e) => setPeriodValue(e.target.value)}
          />
        )
      case 'weekly':
        return (
          <Input
            type="date"
            value={periodValue}
            onChange={(e) => setPeriodValue(e.target.value)}
          />
        )
      case 'monthly':
        return (
          <Input
            type="month"
            value={periodValue}
            onChange={(e) => setPeriodValue(e.target.value)}
          />
        )
      case 'quarterly': {
        const [year, qPart] = periodValue.includes('-Q')
          ? periodValue.split('-Q')
          : [`${new Date().getFullYear()}`, '1']
        return (
          <div className="flex gap-2">
            <Input
              type="number"
              min={2020}
              max={2030}
              value={year}
              onChange={(e) => setPeriodValue(`${e.target.value}-Q${qPart}`)}
              className="w-28"
            />
            <Select
              value={`Q${qPart}`}
              onValueChange={(v) => setPeriodValue(`${year}-${v}`)}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Q1">Q1</SelectItem>
                <SelectItem value="Q2">Q2</SelectItem>
                <SelectItem value="Q3">Q3</SelectItem>
                <SelectItem value="Q4">Q4</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )
      }
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Report generator</SheetTitle>
          <SheetDescription>
            {report ? report.Name : 'Select a report from the catalog'}
          </SheetDescription>
        </SheetHeader>

        {report ? (
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4">
            <div className="space-y-2">
              <Label>Report type</Label>
              <Input value={report.Name} readOnly className="bg-muted/40" />
            </div>

            <div className="space-y-2">
              <Label>Time cycle</Label>
              <Select
                value={cycle}
                onValueChange={(v) => {
                  const next = v as ReportCycle
                  setCycle(next)
                  setPeriodValue(defaultPeriodValue(next))
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {report.SupportedCycles.map((c) => (
                    <SelectItem key={c} value={c}>
                      {REPORT_CYCLE_LABELS[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Period</Label>
              {periodInput()}
              {futurePeriod ? (
                <p className="text-xs text-destructive">Future periods cannot be generated.</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label>Output format</Label>
              <Select value={format} onValueChange={(v) => setFormat(v as ReportOutputFormat)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_OUTPUT_FORMATS.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 rounded-lg border p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Data readiness</span>
                <span className="text-muted-foreground">
                  {checking ? 'Checking…' : readiness?.ready ? 'Data archived ✓' : 'Not ready'}
                </span>
              </div>
              <Progress
                value={readiness?.readinessPct ?? 0}
                className={readiness?.ready ? '' : '[&>div]:bg-destructive'}
              />
              {readiness && !readiness.ready && readiness.missingSources.length > 0 ? (
                <ul className="list-inside list-disc text-xs text-muted-foreground">
                  {readiness.missingSources.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              ) : null}
            </div>

            {report.Category === 'performance' && report.Id === QUARTERLY_APPRAISAL_REPORT_ID ? (
              <p className="text-xs text-muted-foreground">
                Quarterly appraisal data requires a published cycle from{' '}
                <a href="/pms/appraisal/final" className="text-primary hover:underline">
                  executive final review
                </a>
                .
              </p>
            ) : null}
          </div>
        ) : null}

        <SheetFooter className="mt-4">
          <Button
            className="w-full"
            disabled={!canGenerate}
            onClick={() => report && onGenerate({ cycle, periodValue, format })}
          >
            {generating ? <SubmitSpinner /> : null}
            Generate
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
