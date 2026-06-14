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
import { ContentPanel } from '@/components/layout/ContentPanel'
import { PageHeader } from '@/components/pms/PageHeader'

const orders = [
  { id: 'ORD-10482', date: '2026-06-14', customer: 'Northwind Traders', items: 6, total: '$2,480', status: 'Processing' },
  { id: 'ORD-10481', date: '2026-06-13', customer: 'Blue Ocean LLC', items: 2, total: '$890', status: 'Shipped' },
  { id: 'ORD-10480', date: '2026-06-13', customer: 'Summit Retail', items: 11, total: '$4,120', status: 'Pending' },
  { id: 'ORD-10479', date: '2026-06-12', customer: 'Apex Supplies', items: 4, total: '$1,275', status: 'Delivered' },
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
  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description="Manage fulfillment pipeline from placement through delivery."
      />

      <ContentPanel
        title="Order Queue"
        actions={<Button>Create Order</Button>}
        noPadding
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.date}</TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell>{order.items}</TableCell>
                <TableCell>{order.total}</TableCell>
                <TableCell>{statusBadge(order.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ContentPanel>
    </div>
  )
}
