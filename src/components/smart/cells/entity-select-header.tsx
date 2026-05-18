import type { Table } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'

export function EntitySelectHeader({ table }: { table: Table<any> }) {
  return (
    <Checkbox
      checked={
        table.getIsAllPageRowsSelected() ||
        (table.getIsSomePageRowsSelected() && 'indeterminate')
      }
      onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      aria-label='全选'
      className='translate-y-0.5'
    />
  )
}
