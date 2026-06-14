import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  fetchFormulaPalette,
  validateKpiFormula,
} from '@/services/pms/kpi/kpi-service'
import { INDUSTRY_FORMULA_TEMPLATES } from '@/mocks/pms/kpi-store'
import type { FormulaValidationResult } from '@/models/pms/kpi'
import type { KpiIndicator } from '@/models/pms/kpi'

interface FormulaEditorProps {
  initialExpression?: string
  indicator?: KpiIndicator | null
  selfCode?: string
  onApply?: (expression: string) => void
  showApplyButton?: boolean
  readOnly?: boolean
}

export function FormulaEditor({
  initialExpression = '',
  indicator,
  selfCode,
  onApply,
  showApplyButton = true,
  readOnly = false,
}: FormulaEditorProps) {
  const [mode, setMode] = useState<'template' | 'custom'>('custom')
  const [expression, setExpression] = useState(initialExpression)
  const [templateId, setTemplateId] = useState<string>('')
  const [validation, setValidation] = useState<FormulaValidationResult | null>(null)
  const [validating, setValidating] = useState(false)
  const [paletteSearch, setPaletteSearch] = useState('')
  const [palette, setPalette] = useState<{
    indicators: { Code: string; Name: string; IsEnabled: boolean }[]
    parameters: { Code: string; Name: string }[]
    functions: string[]
  } | null>(null)
  const [overwriteOpen, setOverwriteOpen] = useState(false)
  const [pendingTemplateId, setPendingTemplateId] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setExpression(initialExpression)
  }, [initialExpression])

  useEffect(() => {
    void fetchFormulaPalette().then(setPalette)
  }, [])

  const runValidation = useCallback(
    async (expr: string) => {
      if (!expr.trim()) {
        setValidation(null)
        return
      }
      setValidating(true)
      try {
        const result = await validateKpiFormula(expr, selfCode ?? indicator?.Code)
        setValidation(result)
      } finally {
        setValidating(false)
      }
    },
    [selfCode, indicator?.Code],
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      void runValidation(expression)
    }, 400)
    return () => clearTimeout(timer)
  }, [expression, runValidation])

  const applyTemplate = (id: string) => {
    const tpl = INDUSTRY_FORMULA_TEMPLATES[id]
    if (tpl) {
      setExpression(tpl.formula)
      setTemplateId(id)
      setMode('template')
    }
  }

  const handleTemplateSelect = (id: string) => {
    if (mode === 'custom' && expression.trim() && expression !== INDUSTRY_FORMULA_TEMPLATES[id]?.formula) {
      setPendingTemplateId(id)
      setOverwriteOpen(true)
      return
    }
    applyTemplate(id)
  }

  const insertToken = (token: string, enabled = true) => {
    if (readOnly || !enabled) return
    const el = textareaRef.current
    if (el) {
      const start = el.selectionStart
      const end = el.selectionEnd
      const next = expression.slice(0, start) + token + expression.slice(end)
      setExpression(next)
      setMode('custom')
      requestAnimationFrame(() => {
        el.focus()
        const pos = start + token.length
        el.setSelectionRange(pos, pos)
      })
    } else {
      setExpression((prev) => prev + token)
      setMode('custom')
    }
  }

  const filteredPalette = useMemo(() => {
    if (!palette) return null
    const q = paletteSearch.toLowerCase()
    const match = (code: string, name: string) =>
      !q || code.toLowerCase().includes(q) || name.toLowerCase().includes(q)
    return {
      indicators: palette.indicators.filter((i) => match(i.Code, i.Name)),
      parameters: palette.parameters.filter((p) => match(p.Code, p.Name)),
      functions: palette.functions.filter((f) => f.toLowerCase().includes(q)),
    }
  }, [palette, paletteSearch])

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="space-y-4 lg:col-span-3">
        <Tabs value={mode} onValueChange={(v) => setMode(v as 'template' | 'custom')}>
          <TabsList>
            <TabsTrigger value="template" disabled={readOnly}>
              Industry template
            </TabsTrigger>
            <TabsTrigger value="custom" disabled={readOnly}>
              Custom logic
            </TabsTrigger>
          </TabsList>

          <TabsContent value="template" className="space-y-4">
            <div className="space-y-2">
              <Label>Industry template</Label>
              <Select value={templateId} onValueChange={handleTemplateSelect} disabled={readOnly}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a leather-industry preset" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(INDUSTRY_FORMULA_TEMPLATES).map(([id, tpl]) => (
                    <SelectItem key={id} value={id}>
                      {tpl.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="custom" className="space-y-4">
            <div className="flex flex-wrap gap-1.5">
              {palette?.functions.map((fn) => (
                <Button
                  key={fn}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 font-mono text-xs"
                  onClick={() => insertToken(`${fn}(`, true)}
                  disabled={readOnly}
                >
                  {fn}
                </Button>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="space-y-2">
          <Label htmlFor="formula-expression">Formula expression</Label>
          <Textarea
            ref={textareaRef}
            id="formula-expression"
            value={expression}
            onChange={(e) => {
              setExpression(e.target.value)
              setMode('custom')
            }}
            rows={8}
            className="min-h-[200px] font-mono text-sm"
            placeholder="e.g. ROUND((QUALIFIED_QTY / TOTAL_QTY) * 100, 2)"
            readOnly={readOnly}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => void runValidation(expression)}
            disabled={readOnly || validating || !expression.trim()}
          >
            {validating ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            Validate formula
          </Button>
          {validating && (
            <span className="text-sm text-muted-foreground">Validating…</span>
          )}
          {!validating && validation && (
            <>
              {validation.IsValid ? (
                <Badge variant="outline" className="gap-1 border-green-600 text-green-700">
                  <CheckCircle2 className="size-3" />
                  Valid
                </Badge>
              ) : (
                <Badge variant="destructive" className="gap-1">
                  <AlertCircle className="size-3" />
                  Invalid
                </Badge>
              )}
            </>
          )}
        </div>

        {validation && !validation.IsValid && validation.Errors.length > 0 && (
          <Card className="border-destructive/50">
            <CardContent className="pt-4">
              <ul className="list-inside list-disc text-sm text-destructive">
                {validation.Errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {validation?.IsValid && validation.SimulatedResult !== null && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Simulated trial calculation</CardTitle>
              <CardDescription>Mock output from validation service</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="font-mono text-2xl font-semibold">{validation.SimulatedResult}</p>
            </CardContent>
          </Card>
        )}

        {showApplyButton && onApply && !readOnly && (
          <Button
            type="button"
            onClick={() => onApply(expression)}
            disabled={!validation?.IsValid || !expression.trim()}
          >
            Use this formula
          </Button>
        )}
      </div>

      <div className="space-y-4 lg:col-span-2">
        <div className="space-y-2">
          <Label htmlFor="palette-search">Variable palette</Label>
          <Input
            id="palette-search"
            placeholder="Search indicators, parameters…"
            value={paletteSearch}
            onChange={(e) => setPaletteSearch(e.target.value)}
            disabled={readOnly}
          />
        </div>

        <ScrollArea className="h-[420px] rounded-md border p-3">
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                KPI indicators
              </p>
              <div className="space-y-1">
                {filteredPalette?.indicators.map((ind) => (
                  <button
                    key={ind.Code}
                    type="button"
                    disabled={readOnly || !ind.IsEnabled}
                    onClick={() => insertToken(ind.Code, ind.IsEnabled)}
                    className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-sm hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="font-mono text-xs">{ind.Code}</span>
                    <Badge variant={ind.IsEnabled ? 'outline' : 'secondary'} className="text-xs">
                      {ind.IsEnabled ? 'enabled' : 'disabled'}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                System parameters
              </p>
              <div className="space-y-1">
                {filteredPalette?.parameters.map((p) => (
                  <button
                    key={p.Code}
                    type="button"
                    disabled={readOnly}
                    onClick={() => insertToken(p.Code)}
                    className="block w-full rounded px-2 py-1.5 text-left text-sm hover:bg-muted disabled:opacity-50"
                  >
                    <span className="font-mono text-xs">{p.Code}</span>
                    <span className="ml-2 text-muted-foreground">{p.Name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        {validation && validation.ReferencedIndicators.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Referenced indicators</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {validation.ReferencedIndicators.map((ref) => (
                    <TableRow key={ref.Code}>
                      <TableCell className="font-mono text-xs">{ref.Code}</TableCell>
                      <TableCell>
                        <Badge variant={ref.IsEnabled ? 'outline' : 'destructive'}>
                          {ref.IsEnabled ? 'enabled' : 'disabled'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      <AlertDialog open={overwriteOpen} onOpenChange={setOverwriteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Overwrite custom formula?</AlertDialogTitle>
            <AlertDialogDescription>
              Switching templates will replace your current formula expression.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingTemplateId) {
                  applyTemplate(pendingTemplateId)
                }
                setPendingTemplateId(null)
              }}
            >
              Overwrite
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
