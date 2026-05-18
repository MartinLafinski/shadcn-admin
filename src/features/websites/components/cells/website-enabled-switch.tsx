import { toast } from 'sonner'
import { EntityEnabledSwitch } from '@/components/smart/entity-enabled-switch'
import { useSwitchWebsiteMutation } from '@/features/websites/api/websites'
import { type WebsiteData } from '@/features/websites/data/schemas'

export function WebsiteEnabledSwitch({ website }: { website: WebsiteData }) {
  const switchMutation = useSwitchWebsiteMutation()

  const handleToggle = async (website_enabled: boolean) => {
    await switchMutation
      .mutateAsync({
        websiteId: website.website_id,
        data: { website_enabled },
      })
      .then((res) => {
        toast.success(`网站 ${res.website_name} 状态切换成功`)
      })
      .catch((error) => {
        console.error(`网站 ${website.website_name} 状态切换失败:`, error)
        toast.error(`网站 ${website.website_name} 状态切换失败`)
      })
  }

  return (
    <EntityEnabledSwitch
      checked={website.website_enabled}
      onCheckedChange={handleToggle}
      disabled={switchMutation.isPending}
    />
  )
}
