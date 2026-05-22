import { toast } from 'sonner'
import { EntityEnabledSwitch } from '@/components/smart/entity-enabled-switch'
import { useUpdateParamModelRegisterMutation } from '@/features/param-model-register/api/param-model-register'
import { type ParamModelRegisterItemData } from '@/features/param-model-register/data/schemas'

export function ParamModelRegisterEnabledSwitch({
  register,
}: {
  register: ParamModelRegisterItemData
}) {
  const updateMutation = useUpdateParamModelRegisterMutation()

  const handleToggle = async (_enabled: boolean) => {
    await updateMutation
      .mutateAsync({
        registerId: register.register_id,
        data: {
          register_name: register.register_name,
          shard_strategy: register.shard_strategy,
          description: register.description,
        },
      })
      .then((res) => {
        toast.success(
          `参数模型集 ${res.register_name || res.register_slug} 状态切换成功`
        )
      })
      .catch((error) => {
        console.error(
          `参数模型集 ${register.register_name || register.register_slug} 状态切换失败:`,
          error
        )
        toast.error(
          `参数模型集 ${register.register_name || register.register_slug} 状态切换失败`
        )
      })
  }

  return (
    <EntityEnabledSwitch
      checked={register.enabled}
      onCheckedChange={handleToggle}
      disabled={updateMutation.isPending}
    />
  )
}
