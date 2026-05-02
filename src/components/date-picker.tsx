import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

type DatePickerProps = {
  selected: Date | undefined
  onSelect: (date: Date | undefined) => void
  placeholder?: string
  disabled?: (date: Date) => boolean
  availableDates?: string[] // 可选日期列表，格式为 YYYYMMDD
  open?: boolean // 控制 Popover 的打开状态
  onOpenChange?: (open: boolean) => void // Popover 打开/关闭状态变化的回调
  className?: string
}

export function DatePicker({
  selected,
  onSelect,
  placeholder = 'Pick a date',
  disabled,
  availableDates,
  open,
  onOpenChange,
  className = '',
}: DatePickerProps) {
  // 将日期列表转换为 Set 以提高查找性能
  const availableDatesSet = availableDates ? new Set(availableDates) : null

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          data-empty={!selected}
          className={cn(
            'w-[240px] justify-start text-start font-normal data-[empty=true]:text-muted-foreground',
            className
          )}
        >
          {selected ? (
            format(selected, 'MMM d, yyyy')
          ) : (
            <span>{placeholder}</span>
          )}
          <CalendarIcon className='ms-auto h-4 w-4 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0'>
        <Calendar
          mode='single'
          captionLayout='dropdown'
          selected={selected}
          onSelect={onSelect}
          disabled={(date: Date) => {
            // 如果提供了自定义的 disabled 函数，优先使用
            if (disabled) {
              return disabled(date)
            }
            // 如果提供了可选日期列表，检查日期是否在列表中
            if (availableDatesSet && availableDatesSet.size > 0) {
              const year = date.getFullYear()
              const month = String(date.getMonth() + 1).padStart(2, '0')
              const day = String(date.getDate()).padStart(2, '0')
              const dateString = `${year}${month}${day}`
              return !availableDatesSet.has(dateString)
            }
            // 默认限制：不能选择未来日期，不能选择 1900 年之前的日期
            return date > new Date() || date < new Date('1900-01-01')
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
