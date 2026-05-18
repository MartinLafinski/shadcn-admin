import { flexRender, type Row, type Column } from '@tanstack/react-table'
import { type PinningStyles } from '@/lib/ui-helper'
import { TableCell, TableRow } from '@/components/ui/table'
import { type SpiderSessionItemData } from '@/features/spider-sessions/data/schemas'

interface SpiderSessionsTableRowProps {
  row: Row<SpiderSessionItemData>
  rowIdx: number
  isSelected: boolean
  getPinningStyles: (column: Column<SpiderSessionItemData>) => PinningStyles
}

function SpiderSessionsTableRowBase({
  row,
  rowIdx,
  isSelected,
  getPinningStyles,
}: SpiderSessionsTableRowProps) {
  return (
    <TableRow
      key={row.id}
      data-state={isSelected && 'selected'}
      className={`group ${rowIdx % 2 === 0 ? 'bg-background' : 'bg-muted/50'} hover:bg-muted ${isSelected ? '!bg-zinc-200 dark:!bg-slate-800' : ''}`}
    >
      {row.getVisibleCells().map((cell) => {
        const { style, isPinned, isLastLeftPinned, isFirstRightPinned } =
          getPinningStyles(cell.column)
        const metaClassName = cell.column.columnDef.meta?.className || ''
        return (
          <TableCell
            key={cell.id}
            style={style}
            className={[
              'whitespace-nowrap',
              isPinned
                ? `sticky z-[15] ${rowIdx % 2 === 0 ? 'bg-background' : 'bg-slate-50 dark:bg-slate-900'} `
                : 'relative',
              isLastLeftPinned
                ? 'after:absolute after:top-0 after:right-0 after:bottom-0 after:z-[25] after:w-0.5 after:bg-slate-200 dark:after:bg-slate-700'
                : '',
              isFirstRightPinned
                ? 'after:absolute after:top-0 after:bottom-0 after:left-0 after:z-[25] after:w-0.5 after:bg-slate-200 dark:after:bg-slate-700'
                : '',
              metaClassName,
            ].join(' ')}
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        )
      })}
    </TableRow>
  )
}

export const SpiderSessionsTableRow = SpiderSessionsTableRowBase
