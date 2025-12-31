import { useState, useEffect, useRef } from 'react'
import { type Table } from '@tanstack/react-table'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
  entityName: string
  children: React.ReactNode
}

/**
 * 数据表格批量操作工具栏组件
 * 当表格行被选中时显示批量操作工具栏，提供选中行的计数和批量操作按钮
 *
 * @template TData 表格数据类型
 * @param {object} props 组件属性
 * @param {Table<TData>} props.table react-table 实例
 * @param {string} props.entityName 实体名称（例如："任务", "用户"），用于显示文本
 * @param {React.ReactNode} props.children 工具栏中要渲染的批量操作按钮
 * @returns {React.ReactNode | null} 渲染的组件，如果没有选中行则返回 null
 */
export function DataTableBulkActions<TData>({
  table,
  entityName,
  children,
}: DataTableBulkActionsProps<TData>): React.ReactNode | null {
  // 获取当前过滤后被选中的行
  const selectedRows = table.getFilteredSelectedRowModel().rows
  // 计算选中行的数量
  const selectedCount = selectedRows.length
  // 工具栏 DOM 引用，用于键盘导航
  const toolbarRef = useRef<HTMLDivElement>(null)
  // 用于屏幕阅读器的通知状态
  const [announcement, setAnnouncement] = useState('')

  // 当选中行变化时，向屏幕阅读器发送通知
  useEffect(() => {
    if (selectedCount > 0) {
      // 构建通知消息
      const message = `${selectedCount} 条 ${entityName} 已选取. 批量操作工具栏可用.`

      // 使用 queueMicrotask 延迟更新状态以避免级联渲染
      queueMicrotask(() => {
        setAnnouncement(message)
      })

      // 3秒后清除通知，避免屏幕阅读器持续读出
      const timer = setTimeout(() => setAnnouncement(''), 3000)
      return () => clearTimeout(timer)
    }
  }, [selectedCount, entityName])

  // 清除表格行选中状态
  const handleClearSelection = () => {
    table.resetRowSelection()
  }

  // 处理键盘事件，实现工具栏内导航和快捷键功能
  const handleKeyDown = (event: React.KeyboardEvent) => {
    // 获取工具栏内的所有按钮元素
    const buttons = toolbarRef.current?.querySelectorAll('button')
    if (!buttons) return

    // 找到当前获得焦点的按钮索引
    const currentIndex = Array.from(buttons).findIndex(
      (button) => button === document.activeElement
    )

    switch (event.key) {
      case 'ArrowRight': {
        event.preventDefault()
        // 移动到下一个按钮，循环到开头
        const nextIndex = (currentIndex + 1) % buttons.length
        buttons[nextIndex]?.focus()
        break
      }
      case 'ArrowLeft': {
        event.preventDefault()
        // 移动到上一个按钮，循环到末尾
        const prevIndex =
          currentIndex === 0 ? buttons.length - 1 : currentIndex - 1
        buttons[prevIndex]?.focus()
        break
      }
      case 'Home':
        event.preventDefault()
        // 移动到第一个按钮
        buttons[0]?.focus()
        break
      case 'End':
        event.preventDefault()
        // 移动到最后一个按钮
        buttons[buttons.length - 1]?.focus()
        break
      case 'Escape': {
        // 检查 Escape 键是否来自下拉菜单，避免误清除选择
        // 由于 Radix UI 在我们的处理程序运行之前就关闭了下拉菜单，我们无法检查下拉状态
        const target = event.target as HTMLElement
        const activeElement = document.activeElement as HTMLElement

        // 检查事件目标或当前聚焦元素是否是下拉菜单触发器
        const isFromDropdownTrigger =
          target?.getAttribute('data-slot') === 'dropdown-menu-trigger' ||
          activeElement?.getAttribute('data-slot') ===
            'dropdown-menu-trigger' ||
          target?.closest('[data-slot="dropdown-menu-trigger"]') ||
          activeElement?.closest('[data-slot="dropdown-menu-trigger"]')

        // 检查聚焦元素是否在下拉菜单内容内部（内容是传送的）
        const isFromDropdownContent =
          activeElement?.closest('[data-slot="dropdown-menu-content"]') ||
          target?.closest('[data-slot="dropdown-menu-content"]')

        if (isFromDropdownTrigger || isFromDropdownContent) {
          // Escape 是用于关闭下拉菜单的 - 不清除选择
          return
        }

        // Escape 是用于工具栏的 - 清除选择
        event.preventDefault()
        handleClearSelection()
        break
      }
    }
  }

  // 如果没有选中任何行，则不渲染工具栏
  if (selectedCount === 0) {
    return null
  }

  return (
    <>
      {/* 为屏幕阅读器提供实时通知的区域 */}
      <div
        aria-live='polite'
        aria-atomic='true'
        className='sr-only'
        role='status'
      >
        {announcement}
      </div>

      <div
        ref={toolbarRef}
        role='toolbar'
        aria-label={`批量操作选取了 ${selectedCount} 条 ${entityName}${selectedCount > 1 ? 's' : ''}`}
        aria-describedby='bulk-actions-description'
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className={cn(
          'fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl',
          'transition-all delay-100 duration-300 ease-out hover:scale-105',
          'focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none'
        )}
      >
        <div
          className={cn(
            'p-2 shadow-xl',
            'rounded-xl border',
            'bg-background/95 backdrop-blur-lg supports-backdrop-filter:bg-background/60',
            'flex items-center gap-x-2'
          )}
        >
          {/* 清除选择按钮 */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='outline'
                size='icon'
                onClick={handleClearSelection}
                className='size-6 rounded-full'
                aria-label='清空选择'
                title='清空选择 (Escape)'
              >
                <X />
                <span className='sr-only'>清空选择</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>清除选择 (Escape)</p>
            </TooltipContent>
          </Tooltip>

          {/* 分隔线 */}
          <Separator
            className='h-5'
            orientation='vertical'
            aria-hidden='true'
          />

          {/* 选中项计数显示 */}
          <div
            className='flex items-center gap-x-1 text-sm'
            id='bulk-actions-description'
          >
            <Badge
              variant='default'
              className='min-w-8 rounded-lg'
              aria-label={`${selectedCount} 条已选取`}
            >
              {selectedCount}
            </Badge>
            <span className='hidden sm:inline'>
              条{entityName}
            </span>
            已选取
          </div>

          {/* 分隔线 */}
          <Separator
            className='h-5'
            orientation='vertical'
            aria-hidden='true'
          />

          {/* 批量操作按钮（由父组件传入） */}
          {children}
        </div>
      </div>
    </>
  )
}
