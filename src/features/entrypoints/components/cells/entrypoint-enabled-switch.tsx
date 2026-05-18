import { toast } from 'sonner'
import { EntityEnabledSwitch } from '@/components/smart/entity-enabled-switch'
import { useSwitchEntrypointMutation } from '@/features/entrypoints/api/entrypoints'
import { type EntrypointItemData } from '@/features/entrypoints/data/schemas'

export function EntrypointEnabledSwitch({
  entrypoint,
}: {
  entrypoint: EntrypointItemData
}) {
  const switchMutation = useSwitchEntrypointMutation()

  const handleToggle = async (entrypoint_enabled: boolean) => {
    await switchMutation
      .mutateAsync({
        entrypointId: entrypoint.entrypoint_id,
        data: { entrypoint_enabled },
      })
      .then((res) => {
        toast.success(`入口点 ${res.entrypoint_name} 状态切换成功`)
      })
      .catch((error) => {
        console.error(
          `入口点 ${entrypoint.entrypoint_name} 状态切换失败:`,
          error
        )
        toast.error(`入口点 ${entrypoint.entrypoint_name} 状态切换失败`)
      })
  }

  return (
    <EntityEnabledSwitch
      checked={entrypoint.entrypoint_enabled}
      onCheckedChange={handleToggle}
      disabled={switchMutation.isPending}
    />
  )
}
