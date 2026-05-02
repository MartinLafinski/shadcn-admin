import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu'
import { MixerHorizontalIcon } from '@radix-ui/react-icons'
import { type Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

/**
 * DataTableViewOptions 组件 - 数据表格视图选项
 *
 * 该组件提供一个下拉菜单，允许用户控制数据表格中各列的显示与隐藏。
 * 用户可以通过点击"列显示"按钮打开菜单，并在菜单中勾选/取消勾选列的显示状态。
 *
 * 主要功能：
 * 1. 显示可隐藏的列列表
 * 2. 提供复选框控制每列的显示/隐藏状态
 * 3. 支持动态更新表格列显示状态
 *
 * 注意：只有具有 accessorFn（数据访问函数）且允许隐藏的列才会出现在选项中
 */
type DataTableViewOptionsProps<TData> = {
  /**
   * Table 实例对象
   * 来自 @tanstack/react-table，包含表格的所有状态和方法
   */
  table: Table<TData>
}

/**
 * 数据表格视图选项组件
 *
 * 使用说明：
 * 1. 该组件应放置在数据表格的工具栏区域
 * 2. 组件会自动获取表格中所有可隐藏的列并生成对应的控制选项
 * 3. 用户可以动态切换列的显示状态，改变会立即反映在表格中
 *
 * 二次开发指引：
 * - 如需自定义列显示文本，可以在列定义中设置 header 属性
 * - 如需禁用特定列的隐藏功能，在列定义中设置 enableHiding: false
 * - 如需修改菜单宽度，可以调整 DropdownMenuContent 的 w-[150px] 类
 * - 如需修改按钮样式，可以调整 Button 组件的 variant、size 和 className 属性
 */
export function DataTableViewOptions<TData>({
  table,
}: DataTableViewOptionsProps<TData>) {
  return (
    <DropdownMenu modal={false}>
      {/* 下拉菜单触发器 - "列显示"按钮 */}
      <DropdownMenuTrigger asChild>
        <Button
          variant='outline' // 使用轮廓样式按钮
          size='sm' // 小尺寸按钮
          className='ms-auto hidden h-8 lg:flex' // 响应式类：在大屏(lg)上显示为flex，自动边距，高度8，隐藏在小屏上
        >
          <MixerHorizontalIcon className='size-4' />{' '}
          {/* 混合图标，表示列管理 */}
          列显示
        </Button>
      </DropdownMenuTrigger>

      {/* 下拉菜单内容区域 */}
      <DropdownMenuContent align='end' className='w-[150px]'>
        {' '}
        {/* 菜单右对齐，宽度150px */}
        <DropdownMenuLabel>切换列</DropdownMenuLabel> {/* 菜单标题 */}
        <DropdownMenuSeparator /> {/* 分隔线 */}
        {/* 渲染可隐藏的列选项 */}
        {table
          .getAllColumns() // 获取表格的所有列
          .filter(
            (column) =>
              // 过滤条件：列必须有访问函数且允许隐藏
              typeof column.accessorFn !== 'undefined' && column.getCanHide()
          )
          .map((column) => {
            return (
              <DropdownMenuCheckboxItem
                key={column.id} // 使用列ID作为唯一键
                className='capitalize' // 首字母大写样式
                checked={column.getIsVisible()} // 当前列的可见状态
                onCheckedChange={(value) => column.toggleVisibility(!!value)} // 切换列的可见性
              >
                {/* 显示列Header作为选项文本 */}
                {typeof column.columnDef.header === 'string'
                  ? column.columnDef.header
                  : column.id}
              </DropdownMenuCheckboxItem>
            )
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
