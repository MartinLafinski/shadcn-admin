// 图标
import { Eye } from 'lucide-react'
// 按钮控件
import { Button } from '@/components/ui/button.tsx'
// 请求API调用
import { useReqs } from '../reqs-provider.tsx'

/**
 * 请求管理页面的主要操作按钮组件
 * 包含查看任务详情功能按钮
 */
export function ReqsPrimaryActions() {
  const { currentJob, setOpen } = useReqs()

  /**
   * 处理查看任务详情操作
   */
  const onViewTaskDetail = () => {
    if (currentJob) {
      setOpen('viewJob')
    }
  }

  return (
    <div className='flex gap-2'>
      {/* 查看任务详情按钮 */}
      <Button
        variant='outline'
        className='space-x-1'
        onClick={() => onViewTaskDetail()}
        disabled={!currentJob} // 只有选择了任务时才启用按钮
      >
        <span>查看任务详情</span> <Eye size={18} />
      </Button>
    </div>
  )
}
