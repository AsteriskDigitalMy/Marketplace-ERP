import { useState } from 'react'
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

const customers = [
  { id: 'CUS-301', name: 'Northwind Traders', email: 'ops@northwind.com', orders: 48, lifetime: '$84,200' },
  { id: 'CUS-302', name: 'Blue Ocean LLC', email: 'buyers@blueocean.io', orders: 22, lifetime: '$31,450' },
  { id: 'CUS-303', name: 'Summit Retail', email: 'procurement@summit.co', orders: 67, lifetime: '$112,900' },
  { id: 'CUS-304', name: 'Apex Supplies', email: 'sales@apexsupplies.com', orders: 15, lifetime: '$19,800' },
  { id: 'CUS-305', name: 'Horizon Foods', email: 'supply@horizonfoods.com', orders: 31, lifetime: '$52,400' },
  { id: 'CUS-306', name: 'Pacific Textiles', email: 'orders@pactext.com', orders: 54, lifetime: '$98,100' },
  { id: 'CUS-307', name: 'Metro Leather', email: 'buyers@metroleather.my', orders: 19, lifetime: '$27,600' },
  { id: 'CUS-308', name: 'Global Craft Co', email: 'hello@globalcraft.io', orders: 41, lifetime: '$73,250' },
  { id: 'CUS-309', name: 'Urban Outfitters MY', email: 'procure@urbanmy.com', orders: 28, lifetime: '$44,800' },
  { id: 'CUS-310', name: 'Craftsman Studio', email: 'studio@craftsman.my', orders: 12, lifetime: '$18,900' },
  { id: 'CUS-311', name: 'Elite Wholesale', email: 'sales@elitewholesale.com', orders: 63, lifetime: '$121,400' },
  { id: 'CUS-312', name: 'Green Valley Co', email: 'ops@greenvalley.co', orders: 37, lifetime: '$59,300' },
]

export default function Customers() {
  const [search, setSearch] = useState('')

  const filtered = customers.filter((c) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q)
    )
  })

  const table = useClientDataTable(filtered, { pageSize: 5 })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        description="View buyer accounts, order history, and lifetime value."
        actions={<Button>Add Customer</Button>}
      />

      <DataTable
        title="Customer Directory"
        count={filtered.length}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search customers…"
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
              <TableHead>Customer</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Lifetime Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {table.pageData.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>
                  <TableCellPrimary
                    title={customer.name}
                    subtitle={customer.id}
                    leading={<TableAvatar label={customer.name} />}
                  />
                </TableCell>
                <TableCell className="text-muted-foreground">{customer.email}</TableCell>
                <TableCell>{customer.orders}</TableCell>
                <TableCell className="font-semibold">{customer.lifetime}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DataTable>
    </div>
  )
}
