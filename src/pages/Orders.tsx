import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTable, DataTablePagination } from '@/components/layout/DataTable'
import { TableAvatar, TableCellPrimary } from '@/components/layout/TableCellPrimary'
import { PageHeader } from '@/components/pms/PageHeader'
import { useClientDataTable } from '@/hooks/use-client-data-table'

const orders = [
  { id: 'ORD-10482', date: '2026-06-14', customer: 'Northwind Traders', items: 6, total: '$2,480', status: 'Processing' },
  { id: 'ORD-10481', date: '2026-06-13', customer: 'Blue Ocean LLC', items: 2, total: '$890', status: 'Shipped' },
  { id: 'ORD-10480', date: '2026-06-13', customer: 'Summit Retail', items: 11, total: '$4,120', status: 'Pending' },
  { id: 'ORD-10479', date: '2026-06-12', customer: 'Apex Supplies', items: 4, total: '$1,275', status: 'Delivered' },
  { id: 'ORD-10478', date: '2026-06-12', customer: 'Horizon Foods', items: 8, total: '$3,200', status: 'Processing' },
  { id: 'ORD-10477', date: '2026-06-11', customer: 'Pacific Textiles', items: 3, total: '$1,890', status: 'Shipped' },
  { id: 'ORD-10476', date: '2026-06-11', customer: 'Metro Leather', items: 5, total: '$2,100', status: 'Delivered' },
  { id: 'ORD-10475', date: '2026-06-10', customer: 'Global Craft Co', items: 7, total: '$2,750', status: 'Pending' },
]

function statusBadge(status: string) {
  const map: Record<string, 'warning' | 'default' | 'secondary' | 'success'> = {
    Processing: 'warning',
    Pending: 'secondary',
    Shipped: 'default',
    Delivered: 'success',
  }
  return <Badge variant={map[status] ?? 'secondary'}>{status}</Badge>
}

export default function Orders() {
  const [search, setSearch] = useState('')
  const filtered = orders.filter((o) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      o.id.toLowerCase().includes(q) ||
      o.customer.toLowerCase().includes(q) ||
      o.status.toLowerCase().includes(q)
    )
  })
  const table = useClientDataTable(filtered, { pageSize: 5 })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description="Manage fulfillment pipeline from placement through delivery."
        actions={<Button>Create Order</Button>}
      />

      <DataTable
        title="Order Queue"
        count={filtered.length}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search orders…"
        footer={
          <DataTablePagination
            page={table.page}
            pageSize={table.pageSize}
            totalItems={table.totalItems}
            totalPages={table.totalPages}
            rangeStart={table.rangeStart}
            rangeEnd={table.rangeEnd}
            onPageChange={table.setPage}
            onPageSizeChange={table.setPageSize}
          />
        }
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {table.pageData.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <TableCellPrimary
                    title={order.id}
                    subtitle={order.customer}
                    leading={<TableAvatar label={order.customer} />}
                  />
                </TableCell>
                <TableCell className="text-muted-foreground">{order.date}</TableCell>
                <TableCell>{order.items}</TableCell>
                <TableCell className="font-medium">{order.total}</TableCell>
                <TableCell>{statusBadge(order.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DataTable>
    </div>
  )
}
