import { toast } from 'sonner'
import { EntityEnabledSwitch } from '@/components/smart/entity-enabled-switch'
import { useSwitchParamFormMutation } from '../../api/param-forms'
import type { ParamFormItemData } from '../../data/schemas'

interface ParamFormEnabledSwitchProps {
  row: ParamFormItemData
}

export function ParamFormEnabledSwitch({ row }: ParamFormEnabledSwitchProps) {
  const switchMutation = useSwitchParamFormMutation()

  const handleToggle = async (param_form_enabled: boolean) => {
    await switchMutation
      .mutateAsync({
        paramFormId: row.param_form_id,
        data: { param_form_enabled },
      })
      .then((res) => {
        toast.success(`参数要素 ${res.param_form_name} 状态切换成功`)
      })
      .catch((error) => {
        console.error(`参数要素 ${row.param_form_name} 状态切换失败:`, error)
        toast.error(`参数要素 ${row.param_form_name} 状态切换失败`)
      })
  }

  return (
    <EntityEnabledSwitch
      checked={row.param_form_enabled}
      onCheckedChange={handleToggle}
      disabled={switchMutation.isPending}
    />
  )
}
