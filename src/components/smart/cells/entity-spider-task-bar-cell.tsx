import { memo } from 'react'
import { type EntitySpiderTasksCounterData } from '@/lib/base-schemas'
import { cn } from '@/lib/utils'

interface EntitySpiderTaskBarCellProps {
  taskCounter: EntitySpiderTasksCounterData
}

export const EntitySpiderTaskBarCell = memo(
  ({ taskCounter }: EntitySpiderTaskBarCellProps) => {
    const total = taskCounter.total_spider_task_count || 100
    const completed = taskCounter.completed_spider_task_count || 50
    const failed = taskCounter.failed_spider_task_count || 10
    const interrupted = taskCounter.interrupted_spider_task_count || 30
    const canceled = taskCounter.canceled_spider_task_count || 10

    // if (total === 0) {
    //   return <div className='h-2 w-full rounded bg-muted' />
    // }

    const completedPercent = (completed / total) * 100
    const failedPercent = (failed / total) * 100
    const interruptedPercent = (interrupted / total) * 100
    const canceledPercent = (canceled / total) * 100

    return (
      <div className='flex flex-col gap-1'>
        <div className='flex h-2 w-full gap-0.5 overflow-hidden rounded'>
          {completed > 0 && (
            <div
              className={cn('h-full bg-green-400 dark:bg-green-800')}
              style={{ width: `${completedPercent}%` }}
              title={`成功: ${completed} (${completedPercent.toFixed(1)}%)`}
            />
          )}
          {failed > 0 && (
            <div
              className={cn('h-full bg-red-400 dark:bg-red-800')}
              style={{ width: `${failedPercent}%` }}
              title={`失败: ${failed} (${failedPercent.toFixed(1)}%)`}
            />
          )}
          {interrupted > 0 && (
            <div
              className={cn('h-full bg-yellow-400 dark:bg-yellow-800')}
              style={{ width: `${interruptedPercent}%` }}
              title={`中断: ${interrupted} (${interruptedPercent.toFixed(1)}%)`}
            />
          )}
          {canceled > 0 && (
            <div
              className={cn('h-full bg-gray-400 dark:bg-gray-700')}
              style={{ width: `${canceledPercent}%` }}
              title={`取消: ${canceled} (${canceledPercent.toFixed(1)}%)`}
            />
          )}
        </div>
        <div className='flex items-center gap-3 text-xs text-muted-foreground'>
          <div className='flex items-center gap-1'>
            <div className='h-2 w-2 rounded-full bg-cyan-500' />
            <span>{total}</span>
          </div>
          <div className='flex items-center gap-1'>
            <div className='h-2 w-2 rounded-full bg-green-500' />
            <span>{completed}</span>
          </div>
          {failed > 0 && (
            <div className='flex items-center gap-1'>
              <div className='h-2 w-2 rounded-full bg-red-500' />
              <span>{failed}</span>
            </div>
          )}
          {interrupted > 0 && (
            <div className='flex items-center gap-1'>
              <div className='h-2 w-2 rounded-full bg-yellow-500' />
              <span>{interrupted}</span>
            </div>
          )}
          {canceled > 0 && (
            <div className='flex items-center gap-1'>
              <div className='h-2 w-2 rounded-full bg-gray-400' />
              <span>{canceled}</span>
            </div>
          )}
        </div>
      </div>
    )
  }
)
