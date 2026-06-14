import { useState } from 'react'
import { DollarSign, Package, ShoppingBag, Users } from 'lucide-react'
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
import { StatCard } from '@/components/layout/StatCard'
import { PageHeader } from '@/components/pms/PageHeader'
import { useClientDataTable } from '@/hooks/use-client-data-table'

const stats = [
  {
    label: 'Revenue (MTD)',
    value: '$128,450',
    change: '+12.4% vs last month',
    changeTone: 'positive' as const,
    icon: DollarSign,
    iconClassName: 'bg-emerald-500/10 text-emerald-600',
  },
  {
    label: 'Open Orders',
    value: '342',
    change: '+8 new today',
    changeTone: 'positive' as const,
    icon: ShoppingBag,
    iconClassName: 'bg-primary/10 text-primary',
  },
  {
    label: 'Low Stock Items',
    value: '17',
    change: '-3 since yesterday',
    changeTone: 'negative' as const,
    icon: Package,
    iconClassName: 'bg-amber-500/10 text-amber-600',
  },
  {
    label: 'Active Customers',
    value: '1,204',
    change: '+26 this week',
    changeTone: 'positive' as const,
    icon: Users,
    iconClassName: 'bg-violet-500/10 text-violet-600',
  },
]

const recentOrders = [
  { id: 'ORD-10482', customer: 'Northwind Traders', total: '$2,480', status: 'Processing' },
  { id: 'ORD-10481', customer: 'Blue Ocean LLC', total: '$890', status: 'Shipped' },
  { id: 'ORD-10480', customer: 'Summit Retail', total: '$4,120', status: 'Pending' },
  { id: 'ORD-10479', customer: 'Apex Supplies', total: '$1,275', status: 'Delivered' },
  { id: 'ORD-10478', customer: 'Horizon Foods', total: '$3,200', status: 'Processing' },
  { id: 'ORD-10477', customer: 'Pacific Textiles', total: '$1,890', status: 'Shipped' },
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

export default function Dashboard() {
  const [search, setSearch] = useState('')
  const filtered = recentOrders.filter((o) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return o.id.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q)
  })
  const table = useClientDataTable(filtered, { pageSize: 5 })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Central hub for marketplace performance, orders, and inventory health."
      />

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <DataTable
        title="Recent Orders"
        description="Last 24 hours"
        count={filtered.length}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search recent orders…"
        toolbarActions={
          <Button variant="light" size="sm">
            View all
          </Button>
        }
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
