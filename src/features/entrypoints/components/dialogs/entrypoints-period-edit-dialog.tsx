// 引入依赖
import React from 'react'
// 日期格式化
import { format, parseISO } from 'date-fns'
// 表单处理
import { useForm } from 'react-hook-form'
// 数据验证
import { zodResolver } from '@hookform/resolvers/zod'
// 操作结果提示框
import { toast } from 'sonner'
// 按钮控件
import { Button } from '@/components/ui/button.tsx'
// 复选框控件
import { Checkbox } from '@/components/ui/checkbox.tsx'
// 对话框控件
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.tsx'
// 输入框控件
import { Input } from '@/components/ui/input.tsx'
// 日期选择器
import { DatePicker } from '@/components/date-picker'
// 更新入口点日期区间API调用
import { useUpdateEntrypointPeriodMutation } from '../../api/entrypoints.ts'
// 入口点数据结构
import {
  type EntrypointItemData,
  type EntrypointPeriodData,
  EntrypointPeriodSchema,
} from '../../data/schemas.ts'

/**
 * 单独修改入口点日期区间对话框组件的属性接口
 *
 * 该接口定义了 EntrypointsPeriodEditDialog 组件所需的全部属性
 *
 * 属性说明：
 * - open: 控制对话框的打开/关闭状态
 * - onOpenChange: 对话框打开状态变化时的回调函数
 * - currentRow: 当前正在编辑的入口点数据
 */
interface EntrypointsPeriodEditDialogProps {
  /** 对话框的开启状态 */
  open: boolean
  /** 对话框状态变化时的回调函数 */
  onOpenChange: (open: boolean) => void
  /** 当前正在编辑的入口点数据 */
  currentRow: EntrypointItemData
}

/**
 * 辅助函数：将 ISO 字符串转换为上海时区的 Date 对象
 * @param isoString - ISO 格式的日期时间字符串
 * @returns Date 对象或 null
 */
const parseISOToShanghaiDate = (isoString: string | null): Date | null => {
  if (!isoString) return null
  try {
    // 解析 ISO 字符串，获取日期和时间部分
    const date = parseISO(isoString)
    if (isNaN(date.getTime())) return null
    return date
  } catch (error) {
    console.error('Failed to parse ISO string:', error)
    return null
  }
}

/**
 * 辅助函数：将 Date 对象转换为上海时区的 ISO 字符串
 * @param date - Date 对象
 * @returns ISO 格式的日期时间字符串或 null，包含时区偏移 +08:00
 */
const formatDateToShanghaiISO = (date: Date | undefined): string | null => {
  if (!date) return null
  try {
    // 获取本地时间的 ISO 字符串（不带时区）
    const isoString = format(date, "yyyy-MM-dd'T'HH:mm:ss")
    // 添加上海时区偏移 +08:00
    return `${isoString}+08:00`
  } catch (error) {
    console.error('Failed to format date to ISO:', error)
    return null
  }
}

/**
 * 单独修改入口点日期区间对话框组件
 * 用于单独修改入口点的抓取日期区间，提供完整的表单界面
 *
 * 功能说明：
 * - 通过按钮触发对话框显示
 * - 支持设置抓取开始时间和结束时间
 * - 使用日期选择器和时间输入框组合实现日期时间选择
 * - 支持将日期时间设置为空
 * - 自动处理时区转换（上海时间）
 * - 响应式布局，适配不同屏幕尺寸
 * - 表单验证和提交处理
 */
export function EntrypointsPeriodEditDialog({
  open,
  onOpenChange,
  currentRow,
}: EntrypointsPeriodEditDialogProps) {
  // 初始化更新入口点日期区间的mutation
  const updatePeriodMutation = useUpdateEntrypointPeriodMutation()

  // 状态管理：日期和时间
  const [beginDate, setBeginDate] = React.useState<Date | undefined>(undefined)
  const [beginTime, setBeginTime] = React.useState<string>('00:00')
  const [beginEnabled, setBeginEnabled] = React.useState(false)

  const [endDate, setEndDate] = React.useState<Date | undefined>(undefined)
  const [endTime, setEndTime] = React.useState<string>('00:00')
  const [endEnabled, setEndEnabled] = React.useState(false)

  // 初始化表单，设置验证规则和默认值
  const form = useForm<EntrypointPeriodData>({
    resolver: zodResolver(EntrypointPeriodSchema),
    defaultValues: {
      begin_at: null,
      end_at: null,
    },
  })

  // 当对话框打开时，从 currentRow 中初始化日期时间
  React.useEffect(() => {
    if (open && currentRow) {
      const beginAtDate = parseISOToShanghaiDate(currentRow.begin_at as string)
      const endAtDate = parseISOToShanghaiDate(currentRow.end_at as string)

      if (beginAtDate) {
        setBeginDate(beginAtDate)
        setBeginTime(format(beginAtDate, 'HH:mm'))
        setBeginEnabled(true)
      } else {
        setBeginDate(undefined)
        setBeginTime('00:00')
        setBeginEnabled(false)
      }

      if (endAtDate) {
        setEndDate(endAtDate)
        setEndTime(format(endAtDate, 'HH:mm'))
        setEndEnabled(true)
      } else {
        setEndDate(undefined)
        setEndTime('00:00')
        setEndEnabled(false)
      }
    }
  }, [open, currentRow])

  /**
   * 表单提交处理函数
   * 调用API更新入口点日期区间
   */
  const onSubmit = async () => {
    // 构建 begin_at 值
    let beginAtValue: string | null = null
    if (beginEnabled && beginDate) {
      // 将日期和时间组合成完整的 Date 对象
      const [hours, minutes] = beginTime.split(':').map(Number)
      const combinedDate = new Date(beginDate)
      combinedDate.setHours(hours, minutes, 0, 0)
      beginAtValue = formatDateToShanghaiISO(combinedDate)
    }

    // 构建 end_at 值
    let endAtValue: string | null = null
    if (endEnabled && endDate) {
      // 将日期和时间组合成完整的 Date 对象
      const [hours, minutes] = endTime.split(':').map(Number)
      const combinedDate = new Date(endDate)
      combinedDate.setHours(hours, minutes, 0, 0)
      endAtValue = formatDateToShanghaiISO(combinedDate)
    }

    const data: EntrypointPeriodData = {
      begin_at: beginAtValue,
      end_at: endAtValue,
    }

    // 使用 mutation 调用 API 更新入口点日期区间
    await updatePeriodMutation
      .mutateAsync({
        entrypointId: currentRow.entrypoint_id,
        data,
      })
      .then(() => {
        toast.success(`入口点 ${currentRow.entrypoint_name} 日期区间更新成功`) // 操作成功提示
      })
      .catch((error) => {
        console.error(
          `入口点 ${currentRow.entrypoint_name} 日期区间更新失败:`,
          error
        ) // 记录错误日志
        toast.error(`入口点 ${currentRow.entrypoint_name} 日期区间更新失败`) // 操作失败提示
      })

    // 关闭对话框
    onOpenChange(false)
    // 重置表单到默认状态
    form.reset()
    // 重置状态
    setBeginDate(undefined)
    setBeginTime('00:00')
    setBeginEnabled(false)
    setEndDate(undefined)
    setEndTime('00:00')
    setEndEnabled(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>更新日期区间</DialogTitle>
          <DialogDescription>
            修改入口点 {currentRow.entrypoint_name} (ID:{' '}
            {currentRow.entrypoint_id}) 的抓取日期区间
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6 py-4'>
          {/* 开始时间 */}
          <div className='space-y-3'>
            <div className='flex items-center gap-3'>
              <Checkbox
                id='begin-enabled'
                checked={beginEnabled}
                onCheckedChange={(checked) => setBeginEnabled(checked === true)}
              />
              <label
                htmlFor='begin-enabled'
                className='text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
              >
                设置抓取开始时间
              </label>
            </div>

            {beginEnabled && (
              <div className='flex items-start gap-3'>
                <div className='flex-1'>
                  <label className='mb-2 block text-sm font-medium'>日期</label>
                  <DatePicker
                    selected={beginDate}
                    onSelect={setBeginDate}
                    placeholder='选择开始日期'
                  />
                </div>
                <div className='flex-1'>
                  <label className='mb-2 block text-sm font-medium'>时间</label>
                  <Input
                    type='time'
                    value={beginTime}
                    onChange={(e) => setBeginTime(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* 结束时间 */}
          <div className='space-y-3'>
            <div className='flex items-center gap-3'>
              <Checkbox
                id='end-enabled'
                checked={endEnabled}
                onCheckedChange={(checked) => setEndEnabled(checked === true)}
              />
              <label
                htmlFor='end-enabled'
                className='text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
              >
                设置抓取结束时间
              </label>
            </div>

            {endEnabled && (
              <div className='flex items-start gap-3'>
                <div className='flex-1'>
                  <label className='mb-2 block text-sm font-medium'>日期</label>
                  <DatePicker
                    selected={endDate}
                    onSelect={setEndDate}
                    placeholder='选择结束日期'
                  />
                </div>
                <div className='flex-1'>
                  <label className='mb-2 block text-sm font-medium'>时间</label>
                  <Input
                    type='time'
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* 当前值显示 */}
          {(currentRow.begin_at || currentRow.end_at) && (
            <div className='rounded-md bg-muted p-3'>
              <p className='mb-2 text-sm font-medium'>当前值（上海时间）：</p>
              <div className='space-y-1 text-sm'>
                <div>
                  <span className='text-muted-foreground'>开始时间：</span>
                  {currentRow.begin_at ? (
                    <span>
                      {format(
                        parseISOToShanghaiDate(currentRow.begin_at)!,
                        'yyyy-MM-dd HH:mm:ss'
                      )}
                    </span>
                  ) : (
                    <span className='text-muted-foreground'>未设置</span>
                  )}
                </div>
                <div>
                  <span className='text-muted-foreground'>结束时间：</span>
                  {currentRow.end_at ? (
                    <span>
                      {format(
                        parseISOToShanghaiDate(currentRow.end_at)!,
                        'yyyy-MM-dd HH:mm:ss'
                      )}
                    </span>
                  ) : (
                    <span className='text-muted-foreground'>未设置</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => {
              onOpenChange(false)
              form.reset()
              setBeginDate(undefined)
              setBeginTime('00:00')
              setBeginEnabled(false)
              setEndDate(undefined)
              setEndTime('00:00')
              setEndEnabled(false)
            }}
          >
            取消
          </Button>
          <Button onClick={onSubmit} disabled={updatePeriodMutation.isPending}>
            {updatePeriodMutation.isPending ? '保存中...' : '保存'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
