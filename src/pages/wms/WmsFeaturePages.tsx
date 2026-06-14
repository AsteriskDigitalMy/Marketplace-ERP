import { useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EntityListPage } from '@/components/shared/EntityListPage'
import { ScanField } from '@/components/shared/ScanField'
import { PdaLayout } from '@/components/wms/PdaLayout'
import {
  fetchWmsAlerts,
  fetchWmsBatches,
  fetchWmsInbound,
  fetchWmsLocations,
  fetchWmsMaterials,
  fetchWmsOutbound,
  fetchWmsReservations,
  fetchWmsStockTakes,
  fetchWmsStrategies,
  fetchWmsTraceability,
  fetchWmsTransfers,
} from '@/services/wms/wms-service'

export function WmsLocationsPage() {
  return (
    <EntityListPage
      title="Warehouse locations"
      description="Warehouse, zone, and location hierarchy."
      fetchItems={async () => {
        const tree = await fetchWmsLocations()
        const flat: { Id: string; Code: string; Name: string; Type: string }[] = []
        const walk = (nodes: typeof tree) => {
          for (const n of nodes) {
            flat.push({ Id: n.Id, Code: n.Code, Name: n.Name, Type: n.NodeType })
            if (n.Children) walk(n.Children)
          }
        }
        walk(tree)
        return flat
      }}
      rowKey={(r) => r.Id}
      columns={[
        { key: 'code', header: 'Code', cell: (r) => r.Code },
        { key: 'name', header: 'Name', cell: (r) => r.Name },
        { key: 'type', header: 'Type', cell: (r) => r.Type },
      ]}
    />
  )
}

export function WmsMaterialsPage() {
  return (
    <EntityListPage
      title="Material master"
      description="Material warehouse profiles and stock levels."
      fetchItems={fetchWmsMaterials}
      rowKey={(r) => r.Id}
      columns={[
        { key: 'code', header: 'Material', cell: (r) => r.MaterialCode },
        { key: 'name', header: 'Name', cell: (r) => r.MaterialName },
        { key: 'onhand', header: 'On hand', cell: (r) => r.OnHandQty },
        { key: 'minmax', header: 'Min / max', cell: (r) => `${r.MinStock} / ${r.MaxStock}` },
      ]}
    />
  )
}

export function WmsStrategiesPage() {
  return (
    <EntityListPage
      title="Warehouse strategies"
      description="Put-away and picking strategy configuration."
      fetchItems={fetchWmsStrategies}
      rowKey={(r) => r.Id}
      columns={[
        { key: 'code', header: 'Code', cell: (r) => r.StrategyCode },
        { key: 'name', header: 'Strategy', cell: (r) => r.StrategyName },
        { key: 'type', header: 'Type', cell: (r) => r.StrategyType },
        { key: 'active', header: 'Active', cell: (r) => (r.IsActive ? 'Yes' : 'No') },
      ]}
    />
  )
}

export function WmsInboundPage() {
  const [scan, setScan] = useState('')
  return (
    <div className="space-y-6">
      <EntityListPage
        title="Inbound tasks"
        description="Purchase, production, and miscellaneous inbound."
        fetchItems={fetchWmsInbound}
        rowKey={(r) => r.Id}
        columns={[
          { key: 'task', header: 'Task', cell: (r) => r.TaskNumber },
          { key: 'type', header: 'Type', cell: (r) => r.TaskType },
          { key: 'material', header: 'Material', cell: (r) => r.MaterialCode },
          { key: 'qty', header: 'Expected / received', cell: (r) => `${r.ReceivedQty}/${r.ExpectedQty}` },
          { key: 'status', header: 'Status', cell: (r) => <Badge variant="secondary">{r.Status}</Badge> },
        ]}
      />
      <PdaLayout title="PDA receive">
        <ScanField
          value={scan}
          onChange={setScan}
          onScan={() => toast.success('Inbound receipt recorded (mock)')}
        />
        <Button className="w-full" onClick={() => toast.success('Put-away confirmed (mock)')}>
          Confirm put-away
        </Button>
      </PdaLayout>
    </div>
  )
}

export function WmsOutboundPage() {
  const [scan, setScan] = useState('')
  return (
    <div className="space-y-6">
      <EntityListPage
        title="Outbound tasks"
        description="Production picking, sales shipping, and misc outbound."
        fetchItems={fetchWmsOutbound}
        rowKey={(r) => r.Id}
        columns={[
          { key: 'task', header: 'Task', cell: (r) => r.TaskNumber },
          { key: 'type', header: 'Type', cell: (r) => r.TaskType },
          { key: 'material', header: 'Material', cell: (r) => r.MaterialCode },
          { key: 'qty', header: 'Picked / required', cell: (r) => `${r.PickedQty}/${r.RequiredQty}` },
          { key: 'status', header: 'Status', cell: (r) => <Badge variant="secondary">{r.Status}</Badge> },
        ]}
      />
      <PdaLayout title="PDA pick">
        <ScanField
          value={scan}
          onChange={setScan}
          onScan={() => toast.success('Pick scan recorded (mock)')}
        />
      </PdaLayout>
    </div>
  )
}

export function WmsTransfersPage() {
  return (
    <EntityListPage
      title="Inventory transfers"
      description="Inter-location transfers and in-transit tracking."
      fetchItems={fetchWmsTransfers}
      rowKey={(r) => r.Id}
      columns={[
        { key: 'transfer', header: 'Transfer', cell: (r) => r.TransferNumber },
        { key: 'qty', header: 'Quantity', cell: (r) => r.Quantity },
        { key: 'batch', header: 'Batch', cell: (r) => r.BatchNumber ?? '—' },
        { key: 'status', header: 'Status', cell: (r) => <Badge variant="secondary">{r.Status}</Badge> },
      ]}
    />
  )
}

export function WmsAlertsPage() {
  return (
    <EntityListPage
      title="Inventory alerts"
      description="Low stock, overstock, expiry, and quality holds."
      fetchItems={fetchWmsAlerts}
      rowKey={(r) => r.Id}
      columns={[
        { key: 'material', header: 'Material', cell: (r) => r.MaterialCode },
        { key: 'type', header: 'Alert', cell: (r) => r.AlertType },
        { key: 'qty', header: 'Current / threshold', cell: (r) => `${r.CurrentQty} / ${r.ThresholdQty}` },
        { key: 'ack', header: 'Acknowledged', cell: (r) => (r.IsAcknowledged ? 'Yes' : 'No') },
      ]}
    />
  )
}

export function WmsBatchesPage() {
  return (
    <EntityListPage
      title="Batches & expiry"
      description="Batch tracking and shelf-life management."
      fetchItems={fetchWmsBatches}
      rowKey={(r) => r.Id}
      columns={[
        { key: 'material', header: 'Material', cell: (r) => r.MaterialCode },
        { key: 'batch', header: 'Batch', cell: (r) => r.BatchNumber },
        { key: 'qty', header: 'Quantity', cell: (r) => r.Quantity },
        { key: 'status', header: 'Status', cell: (r) => <Badge variant="secondary">{r.Status}</Badge> },
      ]}
    />
  )
}

export function WmsReservationsPage() {
  return (
    <EntityListPage
      title="Inventory reservations"
      description="Reserved stock for orders and work orders."
      fetchItems={fetchWmsReservations}
      rowKey={(r) => r.Id}
      columns={[
        { key: 'material', header: 'Material', cell: (r) => r.MaterialCode },
        { key: 'qty', header: 'Reserved', cell: (r) => r.ReservedQty },
        { key: 'source', header: 'Source', cell: (r) => r.SourceDocumentType },
        { key: 'status', header: 'Status', cell: (r) => <Badge variant="secondary">{r.Status}</Badge> },
      ]}
    />
  )
}

export function WmsStockTakingPage() {
  return (
    <EntityListPage
      title="Stock-taking"
      description="Cycle counts and variance review."
      fetchItems={fetchWmsStockTakes}
      rowKey={(r) => r.Id}
      columns={[
        { key: 'count', header: 'Count', cell: (r) => r.CountNumber },
        { key: 'planned', header: 'Planned', cell: (r) => r.PlannedDate },
        { key: 'variances', header: 'Variances', cell: (r) => r.VarianceCount },
        { key: 'status', header: 'Status', cell: (r) => <Badge variant="secondary">{r.Status}</Badge> },
      ]}
    />
  )
}

export function WmsTraceabilityPage() {
  return (
    <EntityListPage
      title="Material traceability"
      description="Forward and backward traceability chain."
      fetchItems={fetchWmsTraceability}
      rowKey={(r) => r.Id}
      columns={[
        { key: 'material', header: 'Material', cell: (r) => r.MaterialCode },
        { key: 'batch', header: 'Batch', cell: (r) => r.BatchNumber },
        { key: 'direction', header: 'Direction', cell: (r) => r.Direction },
        { key: 'doc', header: 'Document', cell: (r) => r.DocumentNumber },
      ]}
    />
  )
}

export function WmsReportsPage() {
  return (
    <EntityListPage
      title="WMS reports"
      description="Inventory statistics and operational reports."
      fetchItems={async () => [{ Id: '1', Name: 'Stock aging', Category: 'Inventory' }]}
      rowKey={(r) => r.Id}
      columns={[
        { key: 'name', header: 'Report', cell: (r) => r.Name },
        { key: 'cat', header: 'Category', cell: (r) => r.Category },
      ]}
    />
  )
}
