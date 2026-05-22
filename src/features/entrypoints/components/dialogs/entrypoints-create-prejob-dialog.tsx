import React from 'react'
// 表单处理
import { useForm } from 'react-hook-form'
// 数据验证
import { zodResolver } from '@hookform/resolvers/zod'
// 操作结果提示框
import { toast } from 'sonner'
// 按钮控件
import { Button } from '@/components/ui/button.tsx'
// 对话框控件
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.tsx'
// 表单控件
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form.tsx'
// 输入框控件
import { Input } from '@/components/ui/input.tsx'
// 通过入口点创建预备作业API调用
import { useCreatePrejobByEntrypointMutation } from '../../api/entrypoints.ts'
// 入口点数据结构
import {
  type EntrypointItemData,
  type CreatePrejobByEntrypointData,
  CreatePrejobByEntrypointSchema,
} from '../../data/schemas.ts'

/**
 * 通过入口点创建预备作业对话框组件的属性接口
 *
 * 该接口定义了 EntrypointsCreatePrejobDialog 组件所需的全部属性
 *
 * 属性说明：
 * - open: 控制对话框的打开/关闭状态
 * - onOpenChange: 对话框打开状态变化时的回调函数
 * - currentRow: 当前选中的入口点数据
 */
interface EntrypointsCreatePrejobDialogProps {
  /** 对话框的开启状态 */
  open: boolean
  /** 对话框状态变化时的回调函数 */
  onOpenChange: (open: boolean) => void
  /** 当前选中的入口点数据 */
  currentRow: EntrypointItemData
}

/**
 * 通过入口点创建预备作业对话框组件
 * 用于通过入口点创建预备作业，提供完整的表单界面
 *
 * 功能说明：
 * - 通过按钮触发对话框显示
 * - 支持设置预备作业标识后缀和名称后缀
 * - 自动从当前入口点ID创建预备作业
 * - 响应式布局，适配不同屏幕尺寸
 * - 表单验证和提交处理
 */
export function EntrypointsCreatePrejobDialog({
  open,
  onOpenChange,
  currentRow,
}: EntrypointsCreatePrejobDialogProps) {
  // 初始化通过入口点创建预备作业的mutation
  const createPrejobMutation = useCreatePrejobByEntrypointMutation()

  // 初始化表单，设置验证规则和默认值
  const form = useForm<CreatePrejobByEntrypointData>({
    resolver: zodResolver(CreatePrejobByEntrypointSchema),
    defaultValues: {
      entrypoint_id: currentRow.entrypoint_id,
      prelog_slug_suffix: '',
      prelog_name_suffix: '',
    },
  })

  // 当对话框打开或currentRow变化时，重置表单
  React.useEffect(() => {
    if (open && currentRow) {
      form.reset({
        entrypoint_id: currentRow.entrypoint_id,
        prelog_slug_suffix: '',
        prelog_name_suffix: '',
      })
    }
  }, [open, currentRow, form])

  /**
   * 表单提交处理函数
   * 调用API创建预备作业
   */
  const onSubmit = async (data: CreatePrejobByEntrypointData) => {
    // 使用 mutation 调用 API 创建预备作业
    await createPrejobMutation
      .mutateAsync(data)
      .then((result) => {
        toast.success(`预备作业 ${result.prejob_name} 创建成功`) // 操作成功提示
      })
      .catch((error) => {
        console.error(`预备作业创建失败:`, error) // 记录错误日志
        toast.error(`预备作业创建失败`) // 操作失败提示
      })

    // 关闭对话框
    onOpenChange(false)
    // 重置表单到默认状态
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>通过入口点创建预备作业</DialogTitle>
          <DialogDescription>
            为入口点 {currentRow.entrypoint_name} (ID:{' '}
            {currentRow.entrypoint_id}) 创建预备作业
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id='create-prejob-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4 py-4'
          >
            {/* 入口点ID（只读） */}
            <FormField
              control={form.control}
              name='entrypoint_id'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>入口点ID</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled
                      value={currentRow.entrypoint_id.toString()}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 预备作业名称后缀 */}
            <FormField
              control={form.control}
              name='prelog_name_suffix'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>预备作业名称后缀</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder='可选的名称后缀（例如：-版本1, -备份）'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 预备作业标识后缀 */}
            <FormField
              control={form.control}
              name='prelog_slug_suffix'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>预备作业标识后缀</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder='可选的标识后缀（例如：-v1, -backup）'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => {
              onOpenChange(false)
              form.reset()
            }}
          >
            取消
          </Button>
          <Button
            type='submit'
            form='create-prejob-form'
            disabled={createPrejobMutation.isPending}
          >
            {createPrejobMutation.isPending ? '创建中...' : '创建预备作业'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
