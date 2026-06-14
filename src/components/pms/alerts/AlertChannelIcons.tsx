import { Bell, Mail, MessageSquare } from 'lucide-react'
import type { AlertChannel } from '@/models/common/enums'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const CHANNEL_META: Record<AlertChannel, { icon: typeof Bell; label: string }> = {
  in_app: { icon: Bell, label: 'In-app' },
  email: { icon: Mail, label: 'Email' },
  sms: { icon: MessageSquare, label: 'SMS' },
}

export function AlertChannelIcons({ channels }: { channels: AlertChannel[] }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {channels.map((channel) => {
        const meta = CHANNEL_META[channel]
        const Icon = meta.icon
        return (
          <Tooltip key={channel}>
            <TooltipTrigger asChild>
              <span className="inline-flex text-muted-foreground">
                <Icon className="size-4" aria-label={meta.label} />
              </span>
            </TooltipTrigger>
            <TooltipContent>{meta.label}</TooltipContent>
          </Tooltip>
        )
      })}
    </span>
  )
}
