import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from '@radix-ui/react-icons'
import { type Table } from '@tanstack/react-table'
import { cn, getPageNumbers } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'


/**
 * 数据表格分页组件的属性接口
 * @template TData - 表格数据的类型
 */
type DataTablePaginationProps<TData> = {
  /**
   * 表格实例，包含分页、数据等相关信息
   */
  table: Table<TData>
  /**
   * 额外的类名，用于自定义样式
   */
  className?: string
}

/**
 * 数据表格分页组件
 * 
 * 该组件提供完整的分页功能，包括：
 * - 页码选择器（可选择每页显示的项目数量）
 * - 首页、上一页、下一页、末页按钮
 * - 当前页码显示
 * - 智能页码导航（显示当前页及附近的页码，中间用省略号表示连续页码）
 * - 响应式设计，适配不同屏幕尺寸
 * 
 * @template TData - 表格数据的类型
 * @param {DataTablePaginationProps<TData>} props - 组件属性
 * @param {Table<TData>} props.table - 表格实例
 * @param {string} [props.className] - 额外的类名
 * @returns {JSX.Element} 分页组件的JSX元素
 */
export function DataTablePagination<TData>({
  table,
  className,
}: DataTablePaginationProps<TData>) {
  // 计算当前页码（pageIndex从0开始，所以需要+1）
  const currentPage = table.getState().pagination.pageIndex + 1
  // 获取总页数
  const totalPages = table.getPageCount()
  // 获取总项目数
  const totalItemCount = table.getRowCount()
  // 生成页码数组，用于显示页码按钮（如 [1, 2, 3, '...', 10]）
  const pageNumbers = getPageNumbers(currentPage, totalPages)

  return (
    <div
      className={cn(
        'flex items-center justify-between overflow-clip px-2', // 基础样式：弹性布局，居中对齐，左右间距
        '@max-2xl/content:flex-col-reverse @max-2xl/content:gap-4', // 响应式：在小屏幕上垂直排列，反转顺序，添加间距
        className // 传入的额外样式
      )}
      style={{ overflowClipMargin: 1 }} // 防止overflow-clip导致的渲染问题
    >
      {/* 左侧内容：页面大小选择器和页码显示 */}
      <div className='flex w-full items-center justify-between'>
        {/* 在大屏幕上隐藏的页码显示 */}
        <div className='flex w-[120px] items-center justify-center text-sm font-medium @2xl/content:hidden'>
          页码 {currentPage} / {totalPages}
        </div>
        {/* 页面大小选择器 */}
        <div className='flex items-center gap-2 @max-2xl/content:flex-row-reverse'>
          {/* 每页显示项目数量选择器 */}
          <Select
            value={`${table.getState().pagination.pageSize}`} // 当前选择的页面大小
            onValueChange={(value) => {
              // 当选择新值时，更新表格的页面大小
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger className='h-8 w-[70px]'> {/* 选择器触发器样式 */}
              <SelectValue placeholder={table.getState().pagination.pageSize} /> {/* 显示当前值 */}
            </SelectTrigger>
            <SelectContent side='top'> {/* 选择器内容，显示在上方 */}
              {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}> {/* 每个选项 */}
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* 显示每页项目数和总数，仅在小屏幕上隐藏 */}
          <p className='hidden text-sm font-medium sm:block'>条/页 总数 {totalItemCount}</p>
        </div>
      </div>

      {/* 右侧内容：分页按钮 */}
      <div className='flex items-center sm:space-x-6 lg:space-x-8'> {/* 在不同屏幕尺寸上调整间距 */}
        {/* 在小屏幕上隐藏的页码显示 */}
        <div className='flex w-[120px] items-center justify-center text-sm font-medium @max-3xl/content:hidden'>
          页码 {currentPage} / {totalPages}
        </div>
        {/* 分页按钮组 */}
        <div className='flex items-center space-x-2'> {/* 按钮之间的间距 */}
          {/* 首页按钮 - 跳转到第一页 */}
          <Button
            variant='outline'
            className='size-8 p-0 @max-md/content:hidden' // 在小屏幕上隐藏
            onClick={() => table.firstPage()} // 点击时跳转到第一页
            disabled={!table.getCanPreviousPage()} // 当无法前往上一页时禁用（即当前已在第一页）
          >
            <span className='sr-only'>首页</span> {/* 屏幕阅读器专用文本 */}
            <DoubleArrowLeftIcon className='h-4 w-4' /> {/* 首页图标 */}
          </Button>
          
          {/* 上一页按钮 */}
          <Button
            variant='outline'
            className='size-8 p-0'
            onClick={() => table.previousPage()} // 点击时跳转到上一页
            disabled={!table.getCanPreviousPage()} // 当无法前往上一页时禁用
          >
            <span className='sr-only'>上页</span>
            <ChevronLeftIcon className='h-4 w-4' /> {/* 上一页图标 */}
          </Button>

          {/* 页码按钮 - 显示当前页和附近的页码 */}
          {pageNumbers.map((pageNumber, index) => (
            <div key={`${pageNumber}-${index}`} className='flex items-center'>
              {pageNumber === '...' ? ( // 如果是省略号，显示为文本
                <span className='px-1 text-sm text-muted-foreground'>...</span>
              ) : ( // 否则显示为按钮
                <Button
                  variant={currentPage === pageNumber ? 'default' : 'outline'} // 当前页按钮使用默认样式，其他页码使用轮廓样式
                  className='h-8 min-w-8 px-2' // 按钮尺寸
                  onClick={() => table.setPageIndex((pageNumber as number) - 1)} // 点击时跳转到指定页（pageIndex从0开始）
                >
                  <span className='sr-only'>跳转到 {pageNumber}</span> {/* 屏幕阅读器文本 */}
                  {pageNumber} {/* 显示页码 */}
                </Button>
              )}
            </div>
          ))}

          {/* 下一页按钮 */}
          <Button
            variant='outline'
            className='size-8 p-0'
            onClick={() => table.nextPage()} // 点击时跳转到下一页
            disabled={!table.getCanNextPage()} // 当无法前往下一页时禁用
          >
            <span className='sr-only'>下页</span>
            <ChevronRightIcon className='h-4 w-4' /> {/* 下一页图标 */}
          </Button>
          
          {/* 末页按钮 - 跳转到最后一页 */}
          <Button
            variant='outline'
            className='size-8 p-0 @max-md/content:hidden' // 在小屏幕上隐藏
            onClick={() => table.lastPage()} // 点击时跳转到最后一页
            disabled={!table.getCanNextPage()} // 当无法前往下一页时禁用（即当前已在最后一页）
          >
            <span className='sr-only'>尾页</span>
            <DoubleArrowRightIcon className='h-4 w-4' /> {/* 末页图标 */}
          </Button>
        </div>
      </div>
    </div>
  )
}
