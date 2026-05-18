import { toast } from 'sonner'
import { EntityEnabledSwitch } from '@/components/smart/entity-enabled-switch'
import { useSwitchPrejobMutation } from '@/features/prejobs/api/prejobs'
import { type PrejobItemData } from '@/features/prejobs/data/schemas'

export function PrejobEnabledSwitch({ prejob }: { prejob: PrejobItemData }) {
  const m = useSwitchPrejobMutation()
  const toggle = async (v: boolean) => {
    await m
      .mutateAsync({
        prejobId: prejob.prejob_id,
        data: { prejob_enabled: v },
      })
      .then((res) => toast.success(`预备作业 ${res.prejob_name} 状态切换成功`))
      .catch((e) => {
        console.error(`预备作业 ${prejob.prejob_name} 状态切换失败:`, e)
        toast.error(`预备作业 ${prejob.prejob_name} 状态切换失败`)
      })
  }
  return (
    <EntityEnabledSwitch
      checked={prejob.prejob_enabled}
      onCheckedChange={toggle}
      disabled={m.isPending}
    />
  )
}
