import type { Row } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'

export function EntitySelectCell({ row }: { row: Row<any> }) {
  return (
    <Checkbox
      checked={row.getIsSelected()}
      onCheckedChange={(value) => row.toggleSelected(!!value)}
      aria-label='行选择'
      className='translate-y-0.5'
    />
  )
}
