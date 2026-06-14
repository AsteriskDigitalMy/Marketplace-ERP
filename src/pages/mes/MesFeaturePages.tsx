import { Badge } from '@/components/ui/badge'
import { EntityListPage } from '@/components/shared/EntityListPage'
import {
  fetchMesBaoGong,
  fetchMesCosts,
  fetchMesEquipment,
  fetchMesIpqc,
  fetchMesOqc,
  fetchMesRework,
  fetchMesScheduling,
  fetchMesTeams,
  fetchMesTooling,
  fetchMesWages,
  fetchMesWorkOrders,
} from '@/services/mes/mes-service'

export function MesWorkOrdersPage() {
  return (
    <EntityListPage
      title="Work orders"
      description="WO reception, dispatch, and closure linked to SCM sales orders."
      fetchItems={fetchMesWorkOrders}
      rowKey={(r) => r.Id}
      columns={[
        { key: 'wo', header: 'Work order', cell: (r) => r.WorkOrderNumber },
        { key: 'product', header: 'Product', cell: (r) => r.ProductCode },
        { key: 'so', header: 'Sales order', cell: (r) => r.SalesOrderNumber ?? '—' },
        { key: 'progress', header: 'Progress', cell: (r) => `${r.CompletedQty}/${r.PlannedQty}` },
        { key: 'status', header: 'Status', cell: (r) => <Badge variant="secondary">{r.Status}</Badge> },
      ]}
    />
  )
}

export function MesSchedulingPage() {
  return (
    <EntityListPage
      title="Workshop scheduling"
      description="Line scheduling board and daily plan."
      fetchItems={fetchMesScheduling}
      rowKey={(r) => r.Id}
      columns={[
        { key: 'wo', header: 'Work order', cell: (r) => r.WorkOrderNumber },
        { key: 'start', header: 'Planned start', cell: (r) => new Date(r.PlannedStart).toLocaleDateString() },
        { key: 'end', header: 'Planned end', cell: (r) => new Date(r.PlannedEnd).toLocaleDateString() },
        { key: 'status', header: 'Status', cell: (r) => <Badge variant="secondary">{r.Status}</Badge> },
      ]}
    />
  )
}

export function MesProductionPage({ processName }: { processName: string }) {
  return (
    <EntityListPage
      title={processName}
      description="Production reporting and process tracking."
      fetchItems={fetchMesBaoGong}
      rowKey={(r) => r.Id}
      columns={[
        { key: 'process', header: 'Process', cell: (r) => r.ProcessName },
        { key: 'qualified', header: 'Qualified', cell: (r) => r.QualifiedQty },
        { key: 'unqualified', header: 'Unqualified', cell: (r) => r.UnqualifiedQty },
        { key: 'equipment', header: 'Equipment', cell: (r) => r.EquipmentNumber },
      ]}
    />
  )
}

export function MesTraceabilityPage() {
  return (
    <EntityListPage
      title="WIP traceability"
      description="RFID and barcode traceability analysis."
      fetchItems={fetchMesBaoGong}
      rowKey={(r) => r.Id}
      columns={[
        { key: 'wo', header: 'Work order', cell: (r) => r.WorkOrderId.slice(0, 8) },
        { key: 'process', header: 'Process', cell: (r) => r.ProcessName },
        { key: 'qty', header: 'Qualified qty', cell: (r) => r.QualifiedQty },
      ]}
    />
  )
}

export function MesQualityPage() {
  return (
    <EntityListPage
      title="Quality inspections"
      description="IPQC and OQC inspection records."
      fetchItems={async () => {
        const [ipqc, oqc] = await Promise.all([fetchMesIpqc(), fetchMesOqc()])
        return [
          ...ipqc.map((i) => ({ ...i, Type: 'IPQC' as const })),
          ...oqc.map((i) => ({ ...i, Type: 'OQC' as const, ProcessName: 'Final inspection' })),
        ]
      }}
      rowKey={(r) => r.Id}
      columns={[
        { key: 'type', header: 'Type', cell: (r) => r.Type },
        { key: 'process', header: 'Process', cell: (r) => r.ProcessName },
        { key: 'sample', header: 'Sample', cell: (r) => r.SampleSize },
        { key: 'result', header: 'Result', cell: (r) => <Badge variant="secondary">{r.Result}</Badge> },
      ]}
    />
  )
}

export function MesReworkPage() {
  return (
    <EntityListPage
      title="Rework orders"
      description="Defect rework tracking and closure."
      fetchItems={fetchMesRework}
      rowKey={(r) => r.Id}
      columns={[
        { key: 'rework', header: 'Rework', cell: (r) => r.ReworkNumber },
        { key: 'defect', header: 'Defect', cell: (r) => r.DefectType },
        { key: 'qty', header: 'Quantity', cell: (r) => r.Quantity },
        { key: 'status', header: 'Status', cell: (r) => <Badge variant="secondary">{r.Status}</Badge> },
      ]}
    />
  )
}

export function MesEquipmentPage() {
  return (
    <EntityListPage
      title="Equipment"
      description="Equipment ledger, status monitoring, and OEE."
      fetchItems={fetchMesEquipment}
      rowKey={(r) => r.Id}
      columns={[
        { key: 'number', header: 'Number', cell: (r) => r.EquipmentNumber },
        { key: 'name', header: 'Name', cell: (r) => r.EquipmentName },
        { key: 'oee', header: 'OEE', cell: (r) => `${r.OeeActualPct}% / ${r.OeeTargetPct}%` },
        { key: 'status', header: 'Status', cell: (r) => <Badge variant="secondary">{r.Status}</Badge> },
      ]}
    />
  )
}

export function MesToolingPage() {
  return (
    <EntityListPage
      title="Tooling"
      description="Tooling ledger and maintenance."
      fetchItems={fetchMesTooling}
      rowKey={(r) => r.Id}
      columns={[
        { key: 'code', header: 'Code', cell: (r) => r.ToolCode },
        { key: 'name', header: 'Name', cell: (r) => r.ToolName },
        { key: 'status', header: 'Status', cell: (r) => <Badge variant="secondary">{r.Status}</Badge> },
      ]}
    />
  )
}

export function MesPersonnelPage() {
  return (
    <EntityListPage
      title="Personnel & teams"
      description="Production teams and labor organization."
      fetchItems={fetchMesTeams}
      rowKey={(r) => r.Id}
      columns={[
        { key: 'code', header: 'Team code', cell: (r) => r.TeamCode },
        { key: 'name', header: 'Team', cell: (r) => r.TeamName },
        { key: 'members', header: 'Members', cell: (r) => r.MemberCount },
      ]}
    />
  )
}

export function MesWagesPage() {
  return (
    <EntityListPage
      title="Piece-rate wages"
      description="Operator wage lines from Bao-Gong reporting."
      fetchItems={fetchMesWages}
      rowKey={(r) => r.Id}
      columns={[
        { key: 'operator', header: 'Operator', cell: (r) => r.OperatorName },
        { key: 'process', header: 'Process', cell: (r) => r.ProcessName },
        { key: 'pieces', header: 'Pieces', cell: (r) => r.PieceCount },
        { key: 'amount', header: 'Amount', cell: (r) => `$${r.Amount.toFixed(2)}` },
      ]}
    />
  )
}

export function MesCostsPage() {
  return (
    <EntityListPage
      title="Production costs"
      description="Work order cost accumulation."
      fetchItems={fetchMesCosts}
      rowKey={(r) => r.Id}
      columns={[
        { key: 'wo', header: 'Work order', cell: (r) => r.WorkOrderId.slice(0, 8) },
        { key: 'material', header: 'Material', cell: (r) => `$${r.MaterialCost.toLocaleString()}` },
        { key: 'labor', header: 'Labor', cell: (r) => `$${r.LaborCost.toLocaleString()}` },
        { key: 'total', header: 'Total', cell: (r) => `$${r.TotalCost.toLocaleString()}` },
      ]}
    />
  )
}

export function MesReportsPage() {
  return (
    <EntityListPage
      title="Production reports"
      description="Shift and daily production analytics."
      fetchItems={async () => [{ Id: '1', Name: 'Daily output', Period: 'Today' }]}
      rowKey={(r) => r.Id}
      columns={[
        { key: 'name', header: 'Report', cell: (r) => r.Name },
        { key: 'period', header: 'Period', cell: (r) => r.Period },
      ]}
    />
  )
}
