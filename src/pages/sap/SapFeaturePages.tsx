import { Badge } from '@/components/ui/badge'
import { EntityListPage } from '@/components/shared/EntityListPage'
import {
  fetchSapConfig,
  fetchSapCosting,
  fetchSapExceptions,
  fetchSapInventory,
  fetchSapMasterData,
  fetchSapO2c,
  fetchSapP2p,
  fetchSapSyncLogs,
} from '@/services/sap/sap-service'

export function SapConfigPage() {
  return (
    <EntityListPage
      title="Integration configuration"
      description="SAP endpoint, client credentials, and health status."
      fetchItems={async () => [await fetchSapConfig()]}
      rowKey={(r) => r.Id}
      columns={[
        { key: 'endpoint', header: 'Endpoint', cell: (r) => r.SapEndpoint },
        { key: 'client', header: 'Client ID', cell: (r) => r.ClientId },
        { key: 'enabled', header: 'Enabled', cell: (r) => (r.IsEnabled ? 'Yes' : 'No') },
        { key: 'health', header: 'Health', cell: (r) => r.LastHealthStatus ?? '—' },
      ]}
    />
  )
}

export function SapMasterDataPage() {
  return (
    <EntityListPage
      title="Master data synchronization"
      description="PDM/SCM entity sync queue to SAP."
      fetchItems={fetchSapMasterData}
      rowKey={(r) => r.Id}
      columns={[
        { key: 'type', header: 'Entity type', cell: (r) => r.EntityType },
        { key: 'code', header: 'Code', cell: (r) => r.EntityCode },
        { key: 'status', header: 'Status', cell: (r) => <Badge variant="secondary">{r.SyncStatus}</Badge> },
      ]}
    />
  )
}

export function SapP2pPage() {
  return (
    <EntityListPage
      title="Procure-to-pay (AP)"
      description="Purchase order sync to SAP accounts payable."
      fetchItems={fetchSapP2p}
      rowKey={(r) => r.Id}
      columns={[
        { key: 'po', header: 'PO', cell: (r) => r.PoNumber },
        { key: 'sap', header: 'SAP document', cell: (r) => r.SapDocumentNumber ?? '—' },
        { key: 'status', header: 'Status', cell: (r) => <Badge variant="secondary">{r.SyncStatus}</Badge> },
      ]}
    />
  )
}

export function SapO2cPage() {
  return (
    <EntityListPage
      title="Order-to-cash (AR)"
      description="Sales order and delivery sync to SAP."
      fetchItems={fetchSapO2c}
      rowKey={(r) => r.Id}
      columns={[
        { key: 'order', header: 'Order', cell: (r) => r.OrderNumber },
        { key: 'sap', header: 'SAP document', cell: (r) => r.SapDocumentNumber ?? '—' },
        { key: 'status', header: 'Status', cell: (r) => <Badge variant="secondary">{r.SyncStatus}</Badge> },
      ]}
    />
  )
}

export function SapCostingPage() {
  return (
    <EntityListPage
      title="Production cost accounting"
      description="Work order cost sync to SAP CO."
      fetchItems={fetchSapCosting}
      rowKey={(r) => r.Id}
      columns={[
        { key: 'wo', header: 'Work order', cell: (r) => r.WorkOrderNumber },
        { key: 'cost', header: 'Total cost', cell: (r) => `$${r.TotalCost.toLocaleString()}` },
        { key: 'status', header: 'Status', cell: (r) => <Badge variant="secondary">{r.SyncStatus}</Badge> },
      ]}
    />
  )
}

export function SapInventoryPage() {
  return (
    <EntityListPage
      title="Inventory valuation"
      description="Material valuation sync to SAP MM."
      fetchItems={fetchSapInventory}
      rowKey={(r) => r.Id}
      columns={[
        { key: 'material', header: 'Material', cell: (r) => r.MaterialCode },
        { key: 'value', header: 'Valuation', cell: (r) => `$${r.ValuationAmount.toLocaleString()}` },
        { key: 'status', header: 'Status', cell: (r) => <Badge variant="secondary">{r.SyncStatus}</Badge> },
      ]}
    />
  )
}

export function SapLogsPage() {
  return (
    <EntityListPage
      title="Sync logs"
      description="Integration sync history and retry monitoring."
      fetchItems={fetchSapSyncLogs}
      rowKey={(r) => r.Id}
      columns={[
        { key: 'doc', header: 'Document', cell: (r) => r.DocumentNumber },
        { key: 'type', header: 'Type', cell: (r) => r.DocumentType },
        { key: 'direction', header: 'Direction', cell: (r) => r.Direction },
        { key: 'status', header: 'Status', cell: (r) => <Badge variant="secondary">{r.Status}</Badge> },
      ]}
    />
  )
}

export function SapExceptionsPage() {
  return (
    <EntityListPage
      title="Exception inbox"
      description="Failed sync exceptions requiring resolution."
      fetchItems={fetchSapExceptions}
      rowKey={(r) => r.Id}
      columns={[
        { key: 'doc', header: 'Document', cell: (r) => r.DocumentNumber },
        { key: 'code', header: 'Error code', cell: (r) => r.ErrorCode },
        { key: 'message', header: 'Message', cell: (r) => r.ErrorMessage },
        { key: 'status', header: 'Status', cell: (r) => <Badge variant="destructive">{r.Status}</Badge> },
      ]}
    />
  )
}
