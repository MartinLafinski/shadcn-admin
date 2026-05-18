import type React from 'react'
import type { Column } from '@tanstack/react-table'
import { toast } from 'sonner'

export interface PinningStyles {
  style: React.CSSProperties
  isPinned: 'left' | 'right' | false
  isLastLeftPinned: boolean
  isFirstRightPinned: boolean
}

export function getPinningStyles(
  column: Column<any>,
  pinnedLeftIds: string[],
  pinnedRightIds: string[]
) {
  const isPinned = column.getIsPinned()

  const isLastLeftPinned =
    isPinned === 'left' && column.id === pinnedLeftIds[pinnedLeftIds.length - 1]

  const isFirstRightPinned =
    isPinned === 'right' &&
    pinnedRightIds.length > 0 &&
    column.id === pinnedRightIds[0]

  const style: React.CSSProperties = {
    width: `${column.getSize()}px`,
    minWidth: `${column.getSize()}px`,
    left: '',
    right: '',
  }

  if (isPinned === 'left') {
    style.left = `${column.getStart('left')}px`
  }

  if (isPinned === 'right') {
    style.right = `${column.getAfter('right')}px`
  }

  return { style, isPinned, isLastLeftPinned, isFirstRightPinned }
}

/**
 * 统一处理状态切换操作
 */
export async function handleToggle(
  mutation: any,
  data: any,
  successMsg: string,
  errorMsg: string
) {
  try {
    const result = await mutation.mutateAsync(data)
    toast.success(successMsg)
    return result
  } catch (error) {
    console.error(errorMsg, error)
    toast.error(errorMsg)
  }
}
