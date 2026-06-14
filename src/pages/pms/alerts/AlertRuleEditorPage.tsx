import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { PageHeader } from '@/components/pms/PageHeader'
import { AsyncState } from '@/components/pms/AsyncState'
import { PermissionGate } from '@/components/pms/PermissionGate'
import { AlertRulePreview } from '@/components/pms/alerts/AlertRulePreview'
import { usePmsAuth } from '@/contexts/pms-auth-context'
import type { AlertChannel, AlertLevel } from '@/models/common/enums'
import type { AlertRule } from '@/models/pms/operations'
import {
  ALERT_CONDITION_FIELDS,
  ALERT_MONITORED_OBJECTS,
  fetchAlertRule,
  saveAlertRule,
} from '@/services/pms/alerts/alert-rule-service'

const CHANNELS: { value: AlertChannel; label: string }[] = [
  { value: 'in_app', label: 'In-app message' },
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
]

export default function AlertRuleEditorPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { hasPermission } = usePmsAuth()

  const [loading, setLoading] = useState(isEdit)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [discardOpen, setDiscardOpen] = useState(false)

  const [name, setName] = useState('')
  const [type, setType] = useState<AlertRule['Type']>('kpi')
  const [objectId, setObjectId] = useState('')
  const [field, setField] = useState('')
  const [operator, setOperator] = useState<AlertRule['Condition']['Operator']>('>')
  const [value, setValue] = useState('')
  const [level, setLevel] = useState<AlertLevel>('general')
  const [channels, setChannels] = useState<AlertChannel[]>(['in_app'])
  const [isEnabled, setIsEnabled] = useState(true)
  const [formError, setFormError] = useState<string | null>(null)

  const objectOptions = ALERT_MONITORED_OBJECTS[type]
  const fieldOptions = ALERT_CONDITION_FIELDS[type]
  const selectedObject = objectOptions.find((o) => o.Id === objectId)
  const selectedField = fieldOptions.find((f) => f.value === field)
  const valueType = selectedField?.valueType ?? 'number'

  useEffect(() => {
    if (!isEdit || !id) return
    setLoading(true)
    void fetchAlertRule(id)
      .then((rule) => {
        setName(rule.Name)
        setType(rule.Type)
        setObjectId(rule.MonitoredObjectId)
        setField(rule.Condition.Field)
        setOperator(rule.Condition.Operator)
        setValue(String(rule.Condition.Value))
        setLevel(rule.Level)
        setChannels(rule.Channels)
        setIsEnabled(rule.IsEnabled)
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load rule'))
      .finally(() => setLoading(false))
  }, [id, isEdit])

  useEffect(() => {
    if (!objectId && objectOptions[0]) {
      setObjectId(objectOptions[0].Id)
    }
    if (!field && fieldOptions[0]) {
      setField(fieldOptions[0].value)
    }
  }, [type, objectOptions, fieldOptions, objectId, field])

  const markDirty = () => setDirty(true)

  const handleTypeChange = (next: AlertRule['Type']) => {
    markDirty()
    setType(next)
    setObjectId(ALERT_MONITORED_OBJECTS[next][0]?.Id ?? '')
    setField(ALERT_CONDITION_FIELDS[next][0]?.value ?? '')
    setValue('')
  }

  const toggleChannel = (channel: AlertChannel) => {
    markDirty()
    setChannels((prev) =>
      prev.includes(channel) ? prev.filter((c) => c !== channel) : [...prev, channel],
    )
  }

  const handleSave = async () => {
    if (!name.trim()) {
      setFormError('Rule name is required')
      return
    }
    if (!objectId || !selectedObject) {
      setFormError('Select a monitored object')
      return
    }
    if (channels.length === 0) {
      setFormError('Select at least one channel')
      return
    }
    setSubmitting(true)
    setFormError(null)
    try {
      await saveAlertRule({
        Id: id,
        Name: name.trim(),
        Type: type,
        MonitoredObjectId: objectId,
        MonitoredObjectLabel: selectedObject.Label,
        Condition: {
          Field: field,
          Operator: operator,
          Value: valueType === 'number' ? Number(value) : value,
        },
        Level: level,
        Channels: channels,
        IsEnabled: isEnabled,
      })
      for (const ch of channels) {
        toast.info(`Mock: ${ch.replace('_', '-')} queued`)
      }
      toast.success('Rule saved')
      navigate('/pms/alerts/rules')
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSubmitting(false)
    }
  }

  const requestCancel = () => {
    if (dirty) {
      setDiscardOpen(true)
      return
    }
    navigate('/pms/alerts/rules')
  }

  return (
    <PermissionGate allowed={hasPermission('alerts.manage')}>
      <PageHeader
        title={isEdit ? 'Edit alert rule' : 'Create alert rule'}
        description="Define trigger conditions, severity level, and notification channels."
      />

      <AsyncState loading={loading} error={error} onRetry={() => id && void fetchAlertRule(id)}>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4 rounded-xl border bg-card p-6 shadow-[var(--shadow-card)]">
            <div className="space-y-2">
              <Label htmlFor="rule-name">Rule name</Label>
              <Input
                id="rule-name"
                value={name}
                onChange={(e) => {
                  markDirty()
                  setName(e.target.value)
                }}
              />
            </div>

            <div className="space-y-2">
              <Label>Alert type</Label>
              <Select value={type} onValueChange={(v) => handleTypeChange(v as AlertRule['Type'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kpi">KPI indicator</SelectItem>
                  <SelectItem value="project">Project progress</SelectItem>
                  <SelectItem value="filing">Filing overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Monitored object</Label>
              <Select
                value={objectId}
                onValueChange={(v) => {
                  markDirty()
                  setObjectId(v)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select object" />
                </SelectTrigger>
                <SelectContent>
                  {objectOptions.map((o) => (
                    <SelectItem key={o.Id} value={o.Id}>
                      {o.Label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Trigger condition</Label>
              <div className="grid gap-2 sm:grid-cols-3">
                <Select
                  value={field}
                  onValueChange={(v) => {
                    markDirty()
                    setField(v)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fieldOptions.map((f) => (
                      <SelectItem key={f.value} value={f.value}>
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={operator}
                  onValueChange={(v) => {
                    markDirty()
                    setOperator(v as AlertRule['Condition']['Operator'])
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=">">&gt;</SelectItem>
                    <SelectItem value="<">&lt;</SelectItem>
                    <SelectItem value="=">=</SelectItem>
                    <SelectItem value=">=">&gt;=</SelectItem>
                    <SelectItem value="<=">&lt;=</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type={valueType === 'date' ? 'date' : 'number'}
                  value={value}
                  onChange={(e) => {
                    markDirty()
                    setValue(e.target.value)
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Alert level</Label>
              <Select
                value={level}
                onValueChange={(v) => {
                  markDirty()
                  setLevel(v as AlertLevel)
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="important">Important</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Push methods</Label>
              <div className="space-y-2 rounded-md border p-3">
                {CHANNELS.map((ch) => (
                  <label key={ch.value} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={channels.includes(ch.value)}
                      onCheckedChange={() => toggleChannel(ch.value)}
                    />
                    {ch.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-md border px-3 py-2">
              <Label htmlFor="enabled">Enabled on save</Label>
              <Switch
                id="enabled"
                checked={isEnabled}
                onCheckedChange={(v) => {
                  markDirty()
                  setIsEnabled(v)
                }}
              />
            </div>

            {formError ? <p className="text-sm text-destructive">{formError}</p> : null}

            <div className="flex gap-2 pt-2">
              <Button type="button" variant="light" onClick={requestCancel}>
                Cancel
              </Button>
              <Button type="button" disabled={submitting} onClick={() => void handleSave()}>
                Save
              </Button>
            </div>
          </div>

          <AlertRulePreview
            monitoredObjectLabel={selectedObject?.Label ?? ''}
            condition={{ Field: field, Operator: operator, Value: value || '…' }}
            level={level}
            channels={channels}
          />
        </div>
      </AsyncState>

      <AlertDialog open={discardOpen} onOpenChange={setDiscardOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>Your edits will be lost.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setDiscardOpen(false)
                navigate('/pms/alerts/rules')
              }}
            >
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <p className="mt-4 text-sm text-muted-foreground">
        <Link to="/pms/alerts/rules" className="text-primary hover:underline">
          Back to rules list
        </Link>
      </p>
    </PermissionGate>
  )
}
