import type { GeneratedReport } from '@/models/pms/operations'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ReportPreviewPaneProps {
  report: GeneratedReport
  onClose: () => void
  onExportPdf: () => void
  onExportExcel: () => void
  onPrint: () => void
}

export function ReportPreviewPane({
  report,
  onClose,
  onExportPdf,
  onExportExcel,
  onPrint,
}: ReportPreviewPaneProps) {
  return (
    <Card className="report-preview-print shadow-[var(--shadow-card)]">
      <CardHeader className="no-print flex flex-row flex-wrap items-start justify-between gap-3">
        <div>
          <CardTitle className="type-section-title">{report.ReportName}</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            {report.PeriodLabel} · Generated {new Date(report.GeneratedAt).toLocaleString()}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="light" size="sm" onClick={onExportPdf}>
            Export PDF
          </Button>
          <Button variant="light" size="sm" onClick={onExportExcel}>
            Export Excel
          </Button>
          <Button variant="light" size="sm" onClick={onPrint}>
            Print
          </Button>
          <Button variant="light" size="sm" onClick={onClose}>
            Close preview
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {report.Sections.length === 0 ? (
          <p className="text-sm text-muted-foreground">No data for period.</p>
        ) : (
          report.Sections.map((section) => (
            <div key={section.Title} className="space-y-3">
              <h3 className="type-card-title">{section.Title}</h3>
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {section.Columns.map((col) => (
                        <TableHead key={col}>{col}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {section.Rows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={section.Columns.length} className="text-muted-foreground">
                          No data for period.
                        </TableCell>
                      </TableRow>
                    ) : (
                      section.Rows.map((row, ri) => (
                        <TableRow key={ri}>
                          {row.map((cell, ci) => (
                            <TableCell key={ci}>{cell}</TableCell>
                          ))}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              {section.Summary ? (
                <div className="flex flex-wrap gap-4 text-sm">
                  {Object.entries(section.Summary).map(([key, value]) => (
                    <div key={key} className="rounded-md bg-muted/50 px-3 py-2">
                      <span className="text-muted-foreground">{key}: </span>
                      <span className="font-semibold">{value}</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
