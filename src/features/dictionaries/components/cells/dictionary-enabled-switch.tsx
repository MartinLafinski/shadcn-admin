import { toast } from 'sonner'
import { EntityEnabledSwitch } from '@/components/smart/entity-enabled-switch'
import { useSwitchDictionaryMutation } from '@/features/dictionaries/api/dictionaries'
import { type DictionaryItemData } from '@/features/dictionaries/data/schemas'

export function DictionaryEnabledSwitch({
  dictionary,
}: {
  dictionary: DictionaryItemData
}) {
  const switchMutation = useSwitchDictionaryMutation()

  const handleToggle = async (dictionary_enabled: boolean) => {
    await switchMutation
      .mutateAsync({
        id: dictionary.dictionary_id,
        data: { dictionary_enabled },
      })
      .then((res) =>
        toast.success(`属性字典 ${res.dictionary_name} 状态切换成功`)
      )
      .catch((error) => {
        console.error(
          `属性字典 ${dictionary.dictionary_name} 状态切换失败:`,
          error
        )
        toast.error(`属性字典 ${dictionary.dictionary_name} 状态切换失败`)
      })
  }

  return (
    <EntityEnabledSwitch
      checked={dictionary.dictionary_enabled}
      onCheckedChange={handleToggle}
      disabled={switchMutation.isPending}
    />
  )
}
