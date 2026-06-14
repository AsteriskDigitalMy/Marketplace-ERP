import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PageHeader } from '@/components/pms/PageHeader'
import { AsyncState } from '@/components/pms/AsyncState'
import { PermissionGate } from '@/components/pms/PermissionGate'
import { PdcaStatusBadge } from '@/components/pms/pdca/PdcaStatusBadge'
import { usePmsAuth } from '@/contexts/pms-auth-context'
import { PDCA_CATEGORIES, pdcaCategoryLabel } from '@/lib/pms/pdca-helpers'
import type { PdcaProposal } from '@/models/pms/operations'
import { fetchPdcaProposals } from '@/services/pms/pdca/pdca-proposal-service'

export default function PdcaProposalsPage() {
  const { userId, hasPermission } = usePmsAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [proposals, setProposals] = useState<PdcaProposal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const status = (searchParams.get('status') ?? 'all') as PdcaProposal['Status'] | 'all'
  const category = (searchParams.get('category') ?? 'all') as PdcaProposal['Category'] | 'all'
  const search = searchParams.get('q') ?? ''

  const load = async () => {
    setError(null)
    try {
      setProposals(
        await fetchPdcaProposals({
          submitterId: userId,
          status,
          category,
          search,
        }),
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load proposals')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    void load()
  }, [userId, status, category, search])

  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams)
    if (!value || value === 'all') next.delete(key)
    else next.set(key, value)
    setSearchParams(next)
  }

  return (
    <PermissionGate allowed={hasPermission('pdca.submit')}>
      <PageHeader
        title="My Improvement Proposals"
        description="Submit and track improvement proposals for auditor evaluation."
        actions={
          <Button asChild>
            <Link to="/pms/pdca/proposals/new">
              <Plus className="size-4" />
              New proposal
            </Link>
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <Input
          placeholder="Search by title…"
          value={search}
          onChange={(e) => setFilter('q', e.target.value)}
          className="max-w-xs"
        />
        <Select value={status} onValueChange={(v) => setFilter('status', v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending_evaluation">Pending evaluation</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="in_execution">In execution</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={(v) => setFilter('category', v)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {PDCA_CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <AsyncState
        loading={loading}
        error={error}
        onRetry={() => void load()}
        empty={proposals.length === 0}
        emptyTitle="No proposals yet"
        emptyDescription="Submit your first improvement proposal for auditor review."
        emptyAction={
          <Button asChild>
            <Link to="/pms/pdca/proposals/new">Submit your first proposal</Link>
          </Button>
        }
      >
        <div className="rounded-xl border bg-card shadow-[var(--shadow-card)]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Proposal ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {proposals.map((row) => (
                <TableRow key={row.Id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {row.Id.slice(0, 8)}…
                  </TableCell>
                  <TableCell className="font-medium">{row.Title}</TableCell>
                  <TableCell>{pdcaCategoryLabel(row.Category)}</TableCell>
                  <TableCell>{new Date(row.SubmittedAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <PdcaStatusBadge status={row.Status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="link" size="sm" asChild>
                      <Link to={`/pms/pdca/proposals/${row.Id}`}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </AsyncState>
    </PermissionGate>
  )
}
