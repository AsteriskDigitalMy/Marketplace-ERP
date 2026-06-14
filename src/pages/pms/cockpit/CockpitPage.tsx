import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSearchParams } from 'react-router-dom'
import { RefreshCw, Settings2, ShieldOff } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { PageHeader } from '@/components/pms/PageHeader'
import { PermissionGate } from '@/components/pms/PermissionGate'
import { CockpitStatusLegend } from '@/components/pms/cockpit/CockpitStatusLegend'
import { CockpitSummaryCard } from '@/components/pms/cockpit/CockpitSummaryCard'
import { CockpitChart } from '@/components/pms/cockpit/CockpitChart'
import { CockpitWidgetSlot } from '@/components/pms/cockpit/CockpitWidgetSlot'
import { DrillDownSheet } from '@/components/pms/cockpit/DrillDownSheet'
import { usePmsAuth } from '@/contexts/pms-auth-context'
import type { CockpitRole } from '@/models/common/enums'
import type { RoleCockpit } from '@/models/pms/operations'
import {
  fetchCockpitSection,
  fetchRoleCockpit,
  isSupportedCockpitRole,
} from '@/services/pms/cockpit/cockpit-service'

const REFRESH_OPTIONS = [
  { label: 'Off', sec: 0 },
  { label: '30 seconds', sec: 30 },
  { label: '1 minute', sec: 60 },
  { label: '5 minutes', sec: 300 },
]

const ROLE_LABELS: Record<CockpitRole, string> = {
  executive: 'Executive / CFO',
  department_manager: 'Department Manager',
  auditor: 'Auditor',
  hr: 'HR Manager',
  employee: 'Employee',
}

function formatTs(iso: string): string {
  return new Date(iso).toLocaleString()
}

export default function CockpitPage() {
  const { cockpitRole, setCockpitRole, hasPermission } = usePmsAuth()
  const [searchParams] = useSearchParams()
  const [cockpit, setCockpit] = useState<RoleCockpit | null>(null)
  const [cards, setCards] = useState<RoleCockpit['Cards'] | null>(null)
  const [charts, setCharts] = useState<RoleCockpit['Charts'] | null>(null)
  const [table, setTable] = useState<RoleCockpit['Table'] | null>(null)
  const [cardsError, setCardsError] = useState<string | null>(null)
  const [chartsError, setChartsError] = useState<string | null>(null)
  const [tableError, setTableError] = useState<string | null>(null)
  const [cardsLoading, setCardsLoading] = useState(true)
  const [chartsLoading, setChartsLoading] = useState(true)
  const [tableLoading, setTableLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [intervalSec, setIntervalSec] = useState(60)
  const [drill, setDrill] = useState<{
    widgetId: string
    dataPointId: string
    label: string
  } | null>(null)

  const loadSection = useCallback(
    async (section: 'Cards' | 'Charts' | 'Table', role: CockpitRole) => {
      const setLoading =
        section === 'Cards' ? setCardsLoading : section === 'Charts' ? setChartsLoading : setTableLoading
      const setError =
        section === 'Cards' ? setCardsError : section === 'Charts' ? setChartsError : setTableError
      const setData =
        section === 'Cards' ? setCards : section === 'Charts' ? setCharts : setTable

      setLoading(true)
      setError(null)
      try {
        const data = await fetchCockpitSection(role, section)
        setData(data as never)
      } catch (e) {
        setError(e instanceof Error ? e.message : `Failed to load ${section}`)
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  const loadAll = useCallback(
    async (role: CockpitRole, manual = false) => {
      if (!isSupportedCockpitRole(role)) return
      if (manual) setRefreshing(true)
      try {
        const full = await fetchRoleCockpit(role)
        setCockpit(full)
        await Promise.all([
          loadSection('Cards', role),
          loadSection('Charts', role),
          loadSection('Table', role),
        ])
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Failed to load cockpit')
      } finally {
        setRefreshing(false)
      }
    },
    [loadSection],
  )

  useEffect(() => {
    if (!isSupportedCockpitRole(cockpitRole)) return
    void loadAll(cockpitRole)
  }, [cockpitRole, loadAll])

  useEffect(() => {
    if (!intervalSec || !isSupportedCockpitRole(cockpitRole)) return
    const timer = setInterval(() => void loadAll(cockpitRole), intervalSec * 1000)
    return () => clearInterval(timer)
  }, [intervalSec, cockpitRole, loadAll])

  useEffect(() => {
    const drillParam = searchParams.get('drill')
    if (!drillParam) return
    const [widgetId, dataPointId] = drillParam.split(':')
    if (widgetId && dataPointId) {
      setDrill({ widgetId, dataPointId, label: dataPointId })
    }
  }, [searchParams])

  const openDrill = (widgetId: string, dataPointId: string, label: string) => {
    setDrill({ widgetId, dataPointId, label })
  }

  if (!isSupportedCockpitRole(cockpitRole)) {
    return (
      <PermissionGate allowed={hasPermission('cockpit.view')}>
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
          <ShieldOff className="size-12 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Cockpit not available</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Your role does not have a configured cockpit layout. Contact your administrator.
          </p>
          <Button asChild variant="light">
            <a href="/pms/admin/accounts">Contact admin</a>
          </Button>
        </div>
      </PermissionGate>
    )
  }

  return (
    <PermissionGate allowed={hasPermission('cockpit.view')}>
      <PageHeader
        title={cockpit?.CockpitTitle ?? 'KPI Cockpit'}
        description="Role-specific KPI visualization workbench with live refresh."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={cockpitRole}
              onValueChange={(v) => setCockpitRole(v as CockpitRole)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(ROLE_LABELS) as CockpitRole[]).map((role) => (
                  <SelectItem key={role} value={role}>
                    {ROLE_LABELS[role]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={String(intervalSec)}
              onValueChange={(v) => setIntervalSec(Number(v))}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Auto-refresh" />
              </SelectTrigger>
              <SelectContent>
                {REFRESH_OPTIONS.map((o) => (
                  <SelectItem key={o.sec} value={String(o.sec)}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="light"
              size="sm"
              disabled={refreshing}
              onClick={() => void loadAll(cockpitRole, true)}
            >
              <RefreshCw className={`mr-2 size-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            {hasPermission('settings.manage') ? (
              <Button variant="light" size="sm" asChild>
                <Link to="/pms/settings/traffic-lights">
                  <Settings2 className="mr-2 size-4" />
                  Traffic lights
                </Link>
              </Button>
            ) : null}
          </div>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Badge variant="secondary">{ROLE_LABELS[cockpitRole]}</Badge>
        {cockpit ? <span>Last refreshed: {formatTs(cockpit.LastRefreshedAt)}</span> : null}
      </div>

      {cockpitRole === 'executive' ? (
        <Card className="mb-6 shadow-[var(--shadow-card)]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="type-card-title">Open alerts</CardTitle>
            <Button
              variant="link"
              size="link"
              asChild
            >
              <Link to="/pms/alerts?status=open">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              14 open alerts require attention — review in the alerts module (3.1.7).
            </p>
          </CardContent>
        </Card>
      ) : null}

      <CockpitStatusLegend
        onDrillDown={(band) =>
          openDrill(
            'status-legend',
            `status:${band}`,
            `${band.charAt(0).toUpperCase()}${band.slice(1)} status band`,
          )
        }
      />

      <section className="mb-6">
        <h2 className="type-section-title mb-4">Summary</h2>
        <CockpitWidgetSlot
          loading={cardsLoading}
          error={cardsError}
          empty={!cardsLoading && !cardsError && cards?.length === 0}
          onRetry={() => void loadSection('Cards', cockpitRole)}
          skeleton={
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          }
        >
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {cards?.map((card) => (
              <CockpitSummaryCard
                key={card.Id}
                card={card}
                onDrillDown={() => openDrill(card.Id, card.Label, card.Label)}
              />
            ))}
          </div>
        </CockpitWidgetSlot>
      </section>

      <section className="mb-6">
        <h2 className="type-section-title mb-4">Charts</h2>
        <CockpitWidgetSlot
          loading={chartsLoading}
          error={chartsError}
          empty={!chartsLoading && !chartsError && charts?.length === 0}
          onRetry={() => void loadSection('Charts', cockpitRole)}
        >
          <div className="grid gap-4 lg:grid-cols-2">
            {charts?.map((chart) => (
              <CockpitChart
                key={chart.Id}
                chart={chart}
                onSegmentClick={(label) => openDrill(chart.Id, label, `${chart.Title}: ${label}`)}
              />
            ))}
          </div>
        </CockpitWidgetSlot>
      </section>

      <section>
        <h2 className="type-section-title mb-4">Business data</h2>
        <CockpitWidgetSlot
          loading={tableLoading}
          error={tableError}
          empty={!tableLoading && !tableError && table?.Rows.length === 0}
          onRetry={() => void loadSection('Table', cockpitRole)}
        >
          <Card className="shadow-[var(--shadow-card)]">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    {table?.Columns.map((col) => (
                      <TableHead key={col}>{col}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {table?.Rows.map((row, i) => (
                    <TableRow
                      key={i}
                      className="cursor-pointer hover:bg-muted/50"
                      tabIndex={0}
                      onClick={() =>
                        openDrill(
                          'table-row',
                          String(row[table.Columns[0]] ?? i),
                          String(row[table.Columns[0]] ?? 'Row'),
                        )
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          openDrill(
                            'table-row',
                            String(row[table.Columns[0]] ?? i),
                            String(row[table.Columns[0]] ?? 'Row'),
                          )
                        }
                      }}
                    >
                      {table.Columns.map((col) => (
                        <TableCell key={col}>{row[col]}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </CockpitWidgetSlot>
      </section>

      {drill ? (
        <DrillDownSheet
          open={!!drill}
          onOpenChange={(o) => !o && setDrill(null)}
          sourceWidgetId={drill.widgetId}
          dataPointId={drill.dataPointId}
          metricLabel={drill.label}
        />
      ) : null}
    </PermissionGate>
  )
}
