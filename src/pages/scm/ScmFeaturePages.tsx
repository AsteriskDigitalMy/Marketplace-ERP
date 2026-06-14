import { Badge } from '@/components/ui/badge'
import { EntityListPage } from '@/components/shared/EntityListPage'
import {
  fetchScmCustomers,
  fetchScmImportExport,
  fetchScmOrders,
  fetchScmPurchaseOrders,
  fetchScmRequisitions,
  fetchScmSchedules,
  fetchScmSubcontracting,
  fetchScmSuppliers,
} from '@/services/scm/scm-service'

export function ScmCustomersPage() {
  return (
    <EntityListPage
      title="Customers"
      description="Customer master data and credit profiles."
      fetchItems={fetchScmCustomers}
      rowKey={(r) => r.Id}
      columns={[
        { key: 'code', header: 'Code', cell: (r) => r.CustomerCode },
        { key: 'name', header: 'Customer', cell: (r) => r.CustomerName },
        { key: 'tier', header: 'Tier', cell: (r) => <Badge variant="secondary">{r.Tier}</Badge> },
        { key: 'credit', header: 'Credit limit', cell: (r) => `$${r.CreditLimit.toLocaleString()}` },
      ]}
    />
  )
}

export function ScmOrdersPage() {
  return (
    <EntityListPage
      title="Sales orders"
      description="Order creation, review, and tracking."
      fetchItems={fetchScmOrders}
      rowKey={(r) => r.Id}
      columns={[
        { key: 'order', header: 'Order', cell: (r) => r.OrderNumber },
        { key: 'customer', header: 'Customer', cell: (r) => r.CustomerName },
        { key: 'amount', header: 'Amount', cell: (r) => `$${r.TotalAmount.toLocaleString()}` },
        { key: 'status', header: 'Status', cell: (r) => <Badge variant="secondary">{r.Status}</Badge> },
      ]}
    />
  )
}

export function ScmSuppliersPage() {
  return (
    <EntityListPage
      title="Suppliers"
      description="Supplier qualification and lead time management."
      fetchItems={fetchScmSuppliers}
      rowKey={(r) => r.Id}
      columns={[
        { key: 'code', header: 'Code', cell: (r) => r.SupplierCode },
        { key: 'name', header: 'Supplier', cell: (r) => r.SupplierName },
        { key: 'qual', header: 'Qualification', cell: (r) => r.QualificationStatus },
        { key: 'lead', header: 'Lead time', cell: (r) => `${r.LeadTimeDays} days` },
      ]}
    />
  )
}

export function ScmProcurementPage() {
  return (
    <EntityListPage
      title="Procurement requisitions"
      description="Material demand requisitions and approval."
      fetchItems={fetchScmRequisitions}
      rowKey={(r) => r.Id}
      columns={[
        { key: 'req', header: 'Requisition', cell: (r) => r.ReqNumber },
        { key: 'material', header: 'Material', cell: (r) => r.MaterialCode },
        { key: 'qty', header: 'Quantity', cell: (r) => r.Quantity },
        { key: 'status', header: 'Status', cell: (r) => <Badge variant="secondary">{r.Status}</Badge> },
      ]}
    />
  )
}

export function ScmPurchaseOrdersPage() {
  return (
    <EntityListPage
      title="Purchase orders"
      description="PO management with WMS inbound cross-links."
      fetchItems={fetchScmPurchaseOrders}
      rowKey={(r) => r.Id}
      columns={[
        { key: 'po', header: 'PO', cell: (r) => r.PoNumber },
        { key: 'supplier', header: 'Supplier', cell: (r) => r.SupplierName },
        { key: 'amount', header: 'Amount', cell: (r) => `$${r.TotalAmount.toLocaleString()}` },
        { key: 'status', header: 'Status', cell: (r) => <Badge variant="secondary">{r.Status}</Badge> },
      ]}
    />
  )
}

export function ScmSchedulingPage() {
  return (
    <EntityListPage
      title="Production scheduling"
      description="Demand-driven scheduling plans and dispatch."
      fetchItems={fetchScmSchedules}
      rowKey={(r) => r.Id}
      columns={[
        { key: 'plan', header: 'Plan', cell: (r) => r.PlanNumber },
        { key: 'order', header: 'Sales order', cell: (r) => r.OrderNumber },
        { key: 'completion', header: 'Completion', cell: (r) => `${r.CompletionPct}%` },
        { key: 'status', header: 'Status', cell: (r) => <Badge variant="secondary">{r.Status}</Badge> },
      ]}
    />
  )
}

export function ScmSubcontractingPage() {
  return (
    <EntityListPage
      title="Subcontracting"
      description="Outsourced process orders and tracking."
      fetchItems={fetchScmSubcontracting}
      rowKey={(r) => r.Id}
      columns={[
        { key: 'order', header: 'Order', cell: (r) => r.OrderNumber },
        { key: 'process', header: 'Process', cell: (r) => r.ProcessName },
        { key: 'qty', header: 'Quantity', cell: (r) => r.Quantity },
        { key: 'status', header: 'Status', cell: (r) => <Badge variant="secondary">{r.Status}</Badge> },
      ]}
    />
  )
}

export function ScmImportExportPage() {
  return (
    <EntityListPage
      title="Import / export shipping"
      description="International shipment tracking and customs."
      fetchItems={fetchScmImportExport}
      rowKey={(r) => r.Id}
      columns={[
        { key: 'shipment', header: 'Shipment', cell: (r) => r.ShipmentNumber },
        { key: 'direction', header: 'Direction', cell: (r) => r.Direction },
        { key: 'incoterms', header: 'Incoterms', cell: (r) => r.Incoterms },
        { key: 'status', header: 'Status', cell: (r) => <Badge variant="secondary">{r.Status}</Badge> },
      ]}
    />
  )
}

export function ScmReportsPage() {
  return (
    <EntityListPage
      title="SCM reports"
      description="Standard supply chain analytics reports."
      fetchItems={async () => [
        { Id: '1', Name: 'Order fulfillment', Category: 'Sales' },
        { Id: '2', Name: 'Supplier performance', Category: 'Procurement' },
      ]}
      rowKey={(r) => r.Id}
      columns={[
        { key: 'name', header: 'Report', cell: (r) => r.Name },
        { key: 'cat', header: 'Category', cell: (r) => r.Category },
      ]}
    />
  )
}
