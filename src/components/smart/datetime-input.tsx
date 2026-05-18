import React, { useCallback, useMemo } from 'react'
import { format, parse, isValid } from 'date-fns'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { DatePicker } from '@/components/date-picker'

const DATETIME_FORMAT = 'yyyy-MM-dd HH:mm:ss'
const TIME_FORMAT = 'HH:mm:ss'

interface DatetimeInputProps {
  value: string | null | undefined
  onChange: (value: string | null) => void
  className?: string
}

export const DatetimeInput = React.memo(
  ({ value, onChange, className }: DatetimeInputProps) => {
    const parsed = useMemo(() => {
      if (!value) return { date: undefined, time: '' }
      try {
        const d = parse(value, DATETIME_FORMAT, new Date())
        if (!isValid(d)) return { date: undefined, time: '' }
        return { date: d, time: format(d, TIME_FORMAT) }
      } catch {
        return { date: undefined, time: '' }
      }
    }, [value])

    const handleDateChange = useCallback(
      (date: Date | undefined) => {
        const timeStr = parsed.time || '00:00'
        if (date && isValid(date)) {
          const [h, m] = timeStr.split(':')
          date.setHours(Number(h), Number(m), 0, 0)
          onChange(format(date, DATETIME_FORMAT))
        } else if (!date) {
          onChange(null)
        }
      },
      [parsed.time, onChange]
    )

    const handleTimeChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const timeStr = e.target.value || '00:00'
        const date = parsed.date ? new Date(parsed.date) : new Date()
        const [h, m] = timeStr.split(':')
        date.setHours(Number(h), Number(m), 0, 0)
        onChange(format(date, DATETIME_FORMAT))
      },
      [parsed.date, onChange]
    )

    return (
      <div className={cn('flex items-center gap-2', className)}>
        <DatePicker
          selected={parsed.date}
          onSelect={handleDateChange}
          placeholder='选择日期'
          className='w-[180px]'
          disabled={() => false}
        />
        <Input
          type='time'
          value={parsed.time}
          onChange={handleTimeChange}
          className='w-[130px]'
          step={1}
        />
      </div>
    )
  }
)

DatetimeInput.displayName = 'DatetimeInput'
