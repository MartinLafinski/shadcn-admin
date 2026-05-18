import { toast } from 'sonner'
import { EntityEnabledSwitch } from '@/components/smart/entity-enabled-switch'
import { useSwitchSpiderSessionMutation } from '@/features/spider-sessions/api/spider-sessions'
import { type SpiderSessionItemData } from '@/features/spider-sessions/data/schemas'

export function SpiderSessionEnabledSwitch({
  session,
}: {
  session: SpiderSessionItemData
}) {
  const m = useSwitchSpiderSessionMutation()
  const toggle = async (v: boolean) => {
    await m
      .mutateAsync({ id: session.session_id, data: { session_enabled: v } })
      .then((res) => toast.success(`爬虫会话 ${res.session_name} 状态切换成功`))
      .catch((e) => {
        console.error(`爬虫会话 ${session.session_name} 状态切换失败:`, e)
        toast.error(`爬虫会话 ${session.session_name} 状态切换失败`)
      })
  }
  return (
    <EntityEnabledSwitch
      checked={session.session_enabled}
      onCheckedChange={toggle}
      disabled={m.isPending}
    />
  )
}
