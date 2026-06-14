import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { FileBarChart } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/components/pms/PageHeader'
import { AsyncState } from '@/components/pms/AsyncState'
import { PermissionGate } from '@/components/pms/PermissionGate'
import { ReportGeneratorSheet } from '@/components/pms/reports/ReportGeneratorSheet'
import { ReportPreviewPane } from '@/components/pms/reports/ReportPreviewPane'
import { usePmsAuth } from '@/contexts/pms-auth-context'
import {
  formatRelativeTime,
  mockExportFilename,
  REPORT_CATEGORIES,
  REPORT_CYCLE_LABELS,
  reportCategoryLabel,
  type ReportOutputFormat,
} from '@/lib/pms/report-helpers'
import type { GeneratedReport, ReportCatalogItem, ReportCategory, ReportCycle } from '@/models/pms/operations'
import {
  fetchReportCatalog,
  generateReport,
  mockExportReport,
} from '@/services/pms/reports/report-center-service'

export default function ReportCenterPage() {
  const { hasPermission } = usePmsAuth()
  const [searchParams] = useSearchParams()
  const previewRef = useRef<HTMLDivElement>(null)

  const [catalog, setCatalog] = useState<ReportCatalogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedReport, setSelectedReport] = useState<ReportCatalogItem | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [progressOpen, setProgressOpen] = useState(false)
  const [progressStep, setProgressStep] = useState('')
  const [progressPct, setProgressPct] = useState(0)
  const [notReadyOpen, setNotReadyOpen] = useState(false)
  const [notReadySources, setNotReadySources] = useState<string[]>([])
  const [preview, setPreview] = useState<GeneratedReport | null>(null)

  const initialCategory = (searchParams.get('category') as ReportCategory | null) ?? 'production'
  const initialReportId = searchParams.get('report')
  const [activeTab, setActiveTab] = useState<ReportCategory>(
    REPORT_CATEGORIES.some((c) => c.value === initialCategory) ? initialCategory : 'production',
  )

  const load = useCallback(async () => {
    setError(null)
    try {
      setCatalog(await fetchReportCatalog())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load report catalog')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!initialReportId || catalog.length === 0) return
    const item = catalog.find((r) => r.Id === initialReportId)
    if (item) {
      setActiveTab(item.Category)
      setSelectedReport(item)
      setSheetOpen(true)
    }
  }, [initialReportId, catalog])

  const grouped = useMemo(() => {
    const map = new Map<ReportCategory, ReportCatalogItem[]>()
    for (const cat of REPORT_CATEGORIES) map.set(cat.value, [])
    for (const item of catalog) {
      map.get(item.Category)?.push(item)
    }
    return map
  }, [catalog])

  const handleSelect = (item: ReportCatalogItem) => {
    setSelectedReport(item)
    setSheetOpen(true)
  }

  const handleExport = async (report: GeneratedReport, format: 'pdf' | 'excel') => {
    const filename = await mockExportReport(report, format)
    toast.success(`Download started (mock): ${filename}`)
  }

  const handlePrint = () => {
    window.print()
  }

  const handleGenerate = async (input: {
    cycle: ReportCycle
    periodValue: string
    format: ReportOutputFormat
  }) => {
    if (!selectedReport || generating) return
    setGenerating(true)
    setProgressOpen(true)
    setProgressStep('Starting…')
    setProgressPct(0)

    try {
      const report = await generateReport(
        {
          reportId: selectedReport.Id,
          cycle: input.cycle,
          periodValue: input.periodValue,
        },
        (step, pct) => {
          setProgressStep(step)
          setProgressPct(pct)
        },
      )

      setProgressOpen(false)
      setSheetOpen(false)
      void load()

      if (input.format === 'preview') {
        setPreview(report)
        setTimeout(() => previewRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
      } else {
        const ext = input.format === 'pdf' ? 'pdf' : 'xlsx'
        toast.success(`Download started (mock): ${mockExportFilename(report, ext)}`)
      }
    } catch (e) {
      setProgressOpen(false)
      const msg = e instanceof Error ? e.message : 'Generation failed'
      if (msg.includes('not ready')) {
        setNotReadySources(['Archived data incomplete for selected period'])
        setNotReadyOpen(true)
      } else {
        toast.error(msg)
      }
    } finally {
      setGenerating(false)
    }
  }

  return (
    <PermissionGate allowed={hasPermission('reports.view')}>
      <PageHeader
        title="Report Center"
        description="Industry-standard fixed reports with one-click generation, preview, and export."
      />

      <AsyncState
        loading={loading}
        error={error}
        onRetry={() => void load()}
        empty={catalog.length === 0}
        emptyTitle="No report templates"
        emptyDescription="The report catalog could not be loaded."
      >
        <div className="no-print space-y-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ReportCategory)}>
            <TabsList className="flex h-auto flex-wrap gap-1">
              {REPORT_CATEGORIES.map((cat) => (
                <TabsTrigger key={cat.value} value={cat.value}>
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {REPORT_CATEGORIES.map((cat) => (
              <TabsContent key={cat.value} value={cat.value} className="mt-4">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {(grouped.get(cat.value) ?? []).map((item) => (
                    <Card
                      key={item.Id}
                      className="shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-card-hover)]"
                    >
                      <CardHeader className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="metronic-stat-icon bg-primary/10 text-primary">
                            <FileBarChart className="size-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <CardTitle className="text-base leading-snug">{item.Name}</CardTitle>
                            <CardDescription className="mt-1 line-clamp-2">
                              {item.Description}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {item.SupportedCycles.map((c) => (
                            <Badge key={c} variant="outline" className="text-2xs">
                              {REPORT_CYCLE_LABELS[c]}
                            </Badge>
                          ))}
                        </div>
                      </CardHeader>
                      <CardContent className="flex items-center justify-between gap-3">
                        <span className="text-xs text-muted-foreground">
                          Last generated {formatRelativeTime(item.LastGeneratedAt)}
                        </span>
                        <Button size="sm" onClick={() => handleSelect(item)}>
                          Select
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {(grouped.get(cat.value) ?? []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No {reportCategoryLabel(cat.value).toLowerCase()} reports in catalog.
                  </p>
                ) : null}
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {preview ? (
          <div ref={previewRef} className="mt-6">
            <ReportPreviewPane
              report={preview}
              onClose={() => setPreview(null)}
              onExportPdf={() => void handleExport(preview, 'pdf')}
              onExportExcel={() => void handleExport(preview, 'excel')}
              onPrint={handlePrint}
            />
          </div>
        ) : null}
      </AsyncState>

      <ReportGeneratorSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        report={selectedReport}
        generating={generating}
        onGenerate={(input) => void handleGenerate(input)}
      />

      <Dialog open={progressOpen} onOpenChange={setProgressOpen}>
        <DialogContent className="no-print sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Generating report</DialogTitle>
            <DialogDescription>{progressStep}</DialogDescription>
          </DialogHeader>
          <Progress value={progressPct} />
        </DialogContent>
      </Dialog>

      <Dialog open={notReadyOpen} onOpenChange={setNotReadyOpen}>
        <DialogContent className="no-print sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Data not ready</DialogTitle>
            <DialogDescription>
              Generation is blocked until archived data is available for the selected period.
            </DialogDescription>
          </DialogHeader>
          <ul className="list-inside list-disc text-sm text-muted-foreground">
            {notReadySources.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          <DialogFooter>
            <Button variant="light" onClick={() => setNotReadyOpen(false)}>
              Choose different period
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PermissionGate>
  )
}
