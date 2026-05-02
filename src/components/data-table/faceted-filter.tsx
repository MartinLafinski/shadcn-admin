import * as React from 'react'
import { CheckIcon, PlusCircledIcon } from '@radix-ui/react-icons'
import { type Column } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'

/**
 * 数据表格多面过滤组件
 * 提供一个下拉选择器，允许用户根据预定义的选项过滤数据表列
 *
 * 使用场景：
 * - 当数据表格中某列的值是有限的预定义选项时
 * - 需要让用户能够多选过滤条件时
 * - 需要显示每个选项的出现次数时
 */
type DataTableFacetedFilterProps<TData, TValue> = {
  column?: Column<TData, TValue>
  title?: string
  options: {
    label: string // 选项显示文本
    value: string | number | boolean // 选项实际值
    icon?: React.ComponentType<{ className?: string }> // 选项图标（可选）
  }[]
}

/**
 * 数据表格多面过滤组件
 * 该组件创建一个带有多选功能的过滤器，用户可以从预定义的选项列表中选择一个或多个值来过滤表格数据
 *
 * 功能特性：
 * - 显示已选择的过滤项数量
 * - 在大屏幕上显示具体的已选选项标签
 * - 显示每个选项在数据中的出现次数
 * - 提供清除所有过滤项的功能
 *
 * @param column - 表格列对象，用于获取和设置过滤值
 * @param title - 过滤器标题，显示在触发按钮上
 * @param options - 可供选择的过滤选项列表
 */
export function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
  options,
}: DataTableFacetedFilterProps<TData, TValue>) {
  // 获取列中所有唯一值及其出现次数
  const facets = column?.getFacetedUniqueValues()
  // 获取当前已选择的过滤值
  const selectedValues = new Set(column?.getFilterValue() as any[])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='outline' size='sm' className='h-8 border-dashed'>
          <PlusCircledIcon className='size-4' />
          {title}
          {/* 如果有已选择的值，则显示已选择的数量和标签 */}
          {selectedValues?.size > 0 && (
            <>
              <Separator orientation='vertical' className='mx-2 h-4' />
              {/* 在小屏幕上只显示已选择的数量 */}
              <Badge
                variant='secondary'
                className='rounded-sm px-1 font-normal lg:hidden'
              >
                {selectedValues.size}
              </Badge>
              {/* 在大屏幕上显示具体选择的标签 */}
              <div className='hidden space-x-1 lg:flex'>
                {selectedValues.size > 2 ? (
                  // 如果选择超过2个，则只显示数量
                  <Badge
                    variant='secondary'
                    className='rounded-sm px-1 font-normal'
                  >
                    {selectedValues.size} 选择
                  </Badge>
                ) : (
                  // 否则显示每个选项的标签
                  options
                    .filter((option) => selectedValues.has(option.value))
                    .map((option) => (
                      <Badge
                        variant='secondary'
                        key={option.value.toString()}
                        className='rounded-sm px-1 font-normal'
                      >
                        {option.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[200px] p-0' align='start'>
        <Command>
          <CommandInput placeholder={title} />
          <CommandList>
            <CommandEmpty>未找到结果。</CommandEmpty>
            <CommandGroup>
              {/* 渲染所有过滤选项 */}
              {options.map((option) => {
                const isSelected = selectedValues.has(option.value)
                return (
                  <CommandItem
                    key={option.value.toString()}
                    onSelect={() => {
                      // 切换选项的选中状态
                      if (isSelected) {
                        console.log(`Deselecting option: ${option.label}`)
                        selectedValues.delete(option.value)
                      } else {
                        console.log(`Addselecting option: ${option.label}`)
                        selectedValues.add(option.value)
                      }
                      // 更新列的过滤值
                      const filterValues = Array.from(selectedValues)
                      console.log(selectedValues)
                      console.log(filterValues)
                      // column?.setFilterValue([true, false])
                      column?.setFilterValue(
                        filterValues.length ? filterValues : undefined
                      )
                    }}
                  >
                    {/* 选中标记 - 选中时显示对勾图标 */}
                    <div
                      className={cn(
                        'flex size-4 items-center justify-center rounded-sm border border-primary',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'opacity-50 [&_svg]:invisible'
                      )}
                    >
                      <CheckIcon className={cn('h-4 w-4 text-background')} />
                    </div>
                    {/* 选项图标 */}
                    {option.icon && (
                      <option.icon className='size-4 text-muted-foreground' />
                    )}
                    <span>{option.label}</span>
                    {/* 显示该选项在数据中的出现次数 */}
                    {facets?.get(option.value) && (
                      <span className='ms-auto flex h-4 w-4 items-center justify-center font-mono text-xs'>
                        {facets.get(option.value)}
                      </span>
                    )}
                  </CommandItem>
                )
              })}
            </CommandGroup>
            {/* 如果有已选择的选项，则显示清除按钮 */}
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => column?.setFilterValue(undefined)}
                    className='justify-center text-center'
                  >
                    清除过滤项
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
