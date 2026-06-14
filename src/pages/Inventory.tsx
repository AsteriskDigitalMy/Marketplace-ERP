import { AlertTriangle } from 'lucide-react'
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

const inventory = [
  { sku: 'SKU-1001', name: 'Wireless Headphones', stock: 142, reorder: 50, warehouse: 'East' },
  { sku: 'SKU-1002', name: 'USB-C Dock', stock: 28, reorder: 40, warehouse: 'West' },
  { sku: 'SKU-1003', name: 'Ergonomic Chair', stock: 64, reorder: 20, warehouse: 'Central' },
  { sku: 'SKU-1004', name: 'Standing Desk', stock: 12, reorder: 15, warehouse: 'East' },
]

export default function Inventory() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        description="Track stock levels, reorder points, and warehouse allocation."
      />

      <ContentPanel
        title="Stock Overview"
        actions={
          <Button>Add Product</Button>
        }
        noPadding
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>On Hand</TableHead>
              <TableHead>Reorder At</TableHead>
              <TableHead>Warehouse</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventory.map((item) => {
              const low = item.stock < item.reorder
              return (
                <TableRow key={item.sku}>
                  <TableCell className="font-mono text-xs">{item.sku}</TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <span className={low ? 'inline-flex items-center gap-1.5 font-semibold text-destructive' : ''}>
                      {low ? <AlertTriangle className="size-3.5" /> : null}
                      {item.stock}
                    </span>
                  </TableCell>
                  <TableCell>{item.reorder}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.warehouse}</Badge>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </ContentPanel>
    </div>
  )
}
