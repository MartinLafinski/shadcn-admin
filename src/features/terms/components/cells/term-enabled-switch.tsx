import { toast } from 'sonner'
import { EntityEnabledSwitch } from '@/components/smart/entity-enabled-switch'
import { useSwitchTermMutation } from '@/features/terms/api/terms'
import { type TermItemData } from '@/features/terms/data/schemas'

export function TermEnabledSwitch({ term }: { term: TermItemData }) {
  const switchMutation = useSwitchTermMutation()

  const handleToggle = async (term_enabled: boolean) => {
    await switchMutation
      .mutateAsync({
        termId: term.term_id,
        data: { term_enabled },
      })
      .then((res) => {
        toast.success(`术语库 ${res.term_name} 状态切换成功`)
      })
      .catch((error) => {
        console.error(`术语库 ${term.term_name} 状态切换失败:`, error)
        toast.error(`术语库 ${term.term_name} 状态切换失败`)
      })
  }

  return (
    <EntityEnabledSwitch
      checked={term.term_enabled}
      onCheckedChange={handleToggle}
      disabled={switchMutation.isPending}
    />
  )
}
