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

const customers = [
  { id: 'CUS-301', name: 'Northwind Traders', email: 'ops@northwind.com', orders: 48, lifetime: '$84,200' },
  { id: 'CUS-302', name: 'Blue Ocean LLC', email: 'buyers@blueocean.io', orders: 22, lifetime: '$31,450' },
  { id: 'CUS-303', name: 'Summit Retail', email: 'procurement@summit.co', orders: 67, lifetime: '$112,900' },
  { id: 'CUS-304', name: 'Apex Supplies', email: 'sales@apexsupplies.com', orders: 15, lifetime: '$19,800' },
]

export default function Customers() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        description="View buyer accounts, order history, and lifetime value."
      />

      <ContentPanel
        title="Customer Directory"
        actions={<Button>Add Customer</Button>}
        noPadding
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Lifetime Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-mono text-xs">{customer.id}</TableCell>
                <TableCell className="font-medium">{customer.name}</TableCell>
                <TableCell className="text-muted-foreground">{customer.email}</TableCell>
                <TableCell>{customer.orders}</TableCell>
                <TableCell className="font-semibold">{customer.lifetime}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ContentPanel>
    </div>
  )
}
