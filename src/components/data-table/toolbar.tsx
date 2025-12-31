import { Cross2Icon } from '@radix-ui/react-icons'
import { type Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTableFacetedFilter } from './faceted-filter'
import { DataTableViewOptions } from './view-options'

/**
 * 数据表格工具栏组件
 * 提供搜索、筛选和视图选项功能
 */

// 定义工具栏组件的属性接口
type DataTableToolbarProps<TData> = {
  // 表格实例，来自 @tanstack/react-table
  table: Table<TData>
  // 搜索框的占位符文本，默认为 "Filter..."
  searchPlaceholder?: string
  // 指定列搜索的列键名（支持多列），如果未提供则使用全局搜索
  searchKey?: string | string[]
  // 筛选器配置数组，用于创建多选筛选器
  filters?: {
    // 对应表格列的ID
    columnId: string
    // 筛选器显示的标题
    title: string
    // 筛选项列表
    options: {
      // 显示的标签文本
      label: string
      // 实际的值
      value: string | number | boolean
      // 可选的图标组件
      icon?: React.ComponentType<{ className?: string }>
    }[]
  }[]
}

/**
 * 数据表格工具栏组件
 * 
 * 此组件提供以下功能：
 * 1. 搜索功能：支持列搜索（单列或多列）或全局搜索
 * 2. 多选筛选：通过 faceted filter 实现多选项筛选
 * 3. 重置功能：清除所有筛选条件
 * 4. 视图选项：控制表格显示列等设置
 * 
 * 使用方法：
 * - 通过 searchKey 属性决定使用列搜索（单列或多列）还是全局搜索
 * - 通过 filters 属性配置多选筛选器
 * - 可通过 searchPlaceholder 自定义搜索框提示文字
 */
export function DataTableToolbar<TData>({
  table,
  searchPlaceholder = '过滤...', // 默认搜索提示文字
  searchKey,
  filters = [], // 默认为空数组
}: DataTableToolbarProps<TData>) {
  // 规范化 searchKey 为数组
  const searchKeys = searchKey
    ? Array.isArray(searchKey)
      ? searchKey
      : [searchKey]
    : null

  // 判断表格是否应用了筛选条件（包括列筛选和全局筛选）
  const isFiltered =
    table.getState().columnFilters.length > 0 || table.getState().globalFilter

  return (
    <div className='flex items-center justify-between'>
      {/* 左侧工具栏：搜索和筛选 */}
      <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
        {/* 搜索框：根据 searchKey 决定使用列搜索（支持多列）还是全局搜索 */}
        {searchKeys && searchKeys.length > 0 ? (
          // 列搜索：针对特定列的搜索
          <Input
            placeholder={searchPlaceholder}
            value={
              (table.getColumn(searchKeys[0])?.getFilterValue() as string) ?? ''
            }
            onChange={(event) => {
              searchKeys.forEach((key) => {
                table.getColumn(key)?.setFilterValue(event.target.value)
              })
            }}
            className='h-8 w-[150px] lg:w-[250px]'
          />
        ) : (
          // 全局搜索：对表格所有列进行搜索
          <Input
            placeholder={searchPlaceholder}
            value={table.getState().globalFilter ?? ''}
            onChange={(event) => table.setGlobalFilter(event.target.value)}
            className='h-8 w-[150px] lg:w-[250px]'
          />
        )}
        
        {/* 面包屑筛选器：显示配置的筛选选项 */}
        <div className='flex gap-x-2'>
          {filters.map((filter) => {
            // 获取对应列的引用
            const column = table.getColumn(filter.columnId)
            // 如果列不存在则跳过
            if (!column) return null
            // 渲染多选筛选组件
            return (
              <DataTableFacetedFilter
                key={filter.columnId}
                column={column}
                title={filter.title}
                options={filter.options}
              />
            )
          })}
        </div>
        
        {/* 重置按钮：仅在有筛选条件时显示 */}
        {isFiltered && (
          <Button
            variant='ghost'
            onClick={() => {
              // 重置所有列筛选
              table.resetColumnFilters()
              // 清除全局筛选
              table.setGlobalFilter('')
            }}
            className='h-8 px-2 lg:px-3'
          >
            重置
            <Cross2Icon className='ms-2 h-4 w-4' />
          </Button>
        )}
      </div>
      
      {/* 右侧工具栏：视图选项 */}
      <DataTableViewOptions table={table} />
    </div>
  )
}
