import { SmartDatetime } from '@/components/smart/datetime'

interface DatetimeCellProps {
  value: string | number | undefined | null
}

export function DatetimeCell({ value }: DatetimeCellProps) {
  return value ? (
    <SmartDatetime date={value} timezone='Asia/Shanghai' />
  ) : (
    <span className='text-gray-400'>-</span>
  )
}
