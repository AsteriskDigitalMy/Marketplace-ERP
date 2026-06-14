import { useRef, useState } from 'react'
import { ScanLine } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ScanFieldProps {
  label?: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  onScan?: (value: string) => void
  className?: string
  disabled?: boolean
}

export function ScanField({
  label = 'Scan barcode',
  placeholder = 'Scan or enter barcode…',
  value,
  onChange,
  onScan,
  className,
  disabled,
}: ScanFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [scanning, setScanning] = useState(false)

  const simulateScan = () => {
    setScanning(true)
    const mockBarcode = `BC-${Date.now().toString(36).toUpperCase()}`
    setTimeout(() => {
      onChange(mockBarcode)
      onScan?.(mockBarcode)
      setScanning(false)
    }, 400)
  }

  return (
    <div className={cn('space-y-2', className)}>
      {label ? (
        <label className="text-sm font-medium text-foreground" htmlFor="scan-field">
          {label}
        </label>
      ) : null}
      <div className="flex gap-2">
        <Input
          id="scan-field"
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled || scanning}
          className="font-mono text-base"
          autoComplete="off"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && value.trim()) {
              onScan?.(value.trim())
            }
          }}
        />
        <Button
          type="button"
          variant="secondary"
          size="icon"
          onClick={simulateScan}
          disabled={disabled || scanning}
          aria-label="Simulate barcode scan"
        >
          <ScanLine className={cn('size-5', scanning && 'animate-pulse')} />
        </Button>
      </div>
    </div>
  )
}
