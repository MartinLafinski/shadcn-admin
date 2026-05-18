import React from 'react'
import { type EntityStatusData } from '@/lib/base-schemas.ts'
import { Badge } from '@/components/ui/badge.tsx'

interface EntityInheritStatusCellProps {
  entity: EntityStatusData
}

export const EntityInheritStatusCell = React.memo(
  ({ entity }: EntityInheritStatusCellProps) => {
    const enabled = entity.has_enabled
    const locked = entity.has_locked
    const paused = entity.has_paused
    const limited = entity.has_limited
    const expired = entity?.has_expired ?? false
    const canApply = entity.can_apply

    let jobClassName = 'bg-black text-white'
    let applyStatus = '未知'

    if (canApply) {
      jobClassName =
        'text-green-500 border-green-400 bg-green-300/20 dark:text-green-300 dark:border-green-700 dark:bg-green-800'
      applyStatus = '放行'
    } else if (!enabled) {
      jobClassName =
        'text-red-500 border-red-400 bg-red-300/20 dark:text-red-300 dark:border-red-700 dark:bg-red-800'
      applyStatus = '禁止'
    } else if (expired) {
      jobClassName =
        'text-rose-500 border-rose-400 bg-rose-300/20 dark:text-rose-300 dark:border-rose-700 dark:bg-rose-800'
      applyStatus = '过期'
    } else if (locked) {
      jobClassName =
        'text-yellow-600 border-yellow-400 bg-yellow-300/20 dark:text-yellow-400 dark:border-yellow-700 dark:bg-yellow-800'
      applyStatus = '锁定'
    } else if (paused) {
      jobClassName =
        'text-violet-500 border-violet-400 bg-violet-300/20 dark:text-violet-300 dark:border-violet-700 dark:bg-violet-800'
      applyStatus = '暂停'
    } else if (limited) {
      jobClassName =
        'text-stone-500 border-stone-400 bg-stone-300/20 dark:text-stone-300 dark:border-stone-500 dark:bg-stone-600'
      applyStatus = '受限'
    } else if (!canApply) {
      jobClassName =
        'text-gray-500 border-gray-400 bg-gray-300/20 dark:text-gray-300'
      applyStatus = '超限'
    }

    return (
      <div className='flex items-center gap-1'>
        <div className='grid h-6 w-6 grid-cols-2 gap-0.5'>
          {/* 可用状态 - 左上 */}
          <div
            className={
              enabled && !expired
                ? 'bg-green-400 dark:bg-green-800'
                : 'bg-red-400 dark:bg-red-800'
            }
          />

          {/* 锁定状态 - 右上 */}
          <div
            className={
              locked
                ? 'bg-yellow-400 dark:bg-yellow-800'
                : 'bg-green-400 dark:bg-green-800'
            }
          />

          {/* 运转状态 - 左下 */}
          <div
            className={
              paused
                ? 'bg-violet-400 dark:bg-violet-800'
                : 'bg-green-400 dark:bg-green-800'
            }
          />

          {/* 受限状态 - 右下 */}
          <div
            className={
              limited
                ? 'bg-stone-400 dark:bg-stone-600'
                : 'bg-green-400 dark:bg-green-800'
            }
          />
        </div>
        <Badge
          variant='ghost'
          className={`${jobClassName} h-6 min-w-[40px] justify-center rounded-none px-1 py-0 text-sm`}
        >
          {applyStatus}
        </Badge>
      </div>
    )
  }
)

EntityInheritStatusCell.displayName = 'EntityInheritStatusCell'
