import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PageHeader } from '@/components/pms/PageHeader'

export default function Settings() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Configure marketplace integrations, notifications, and team access."
      />

      <Card className="max-w-xl shadow-[var(--shadow-card)]">
        <CardHeader>
          <CardTitle>General preferences</CardTitle>
          <CardDescription>Update your marketplace workspace defaults.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <Label htmlFor="company">Company Name</Label>
              <Input id="company" defaultValue="Marketplace ERP" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Default Currency</Label>
              <Select defaultValue="USD">
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD — US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR — Euro</SelectItem>
                  <SelectItem value="GBP">GBP — British Pound</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="threshold">Low Stock Alert Threshold</Label>
              <Input id="threshold" type="number" defaultValue={20} min={1} />
            </div>
            <label className="flex items-center gap-2.5 text-sm">
              <Checkbox defaultChecked />
              Email notifications for new orders
            </label>
            <Button type="submit">Save Changes</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
