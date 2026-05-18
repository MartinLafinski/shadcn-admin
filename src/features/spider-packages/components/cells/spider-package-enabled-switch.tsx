import { toast } from 'sonner'
import { EntityEnabledSwitch } from '@/components/smart/entity-enabled-switch'
import { useSwitchSpiderPackageMutation } from '@/features/spider-packages/api/spider-packages'
import { type SpiderPackageItemData } from '@/features/spider-packages/data/schemas'

export function SpiderPackageEnabledSwitch({
  spiderPackage,
}: {
  spiderPackage: SpiderPackageItemData
}) {
  const switchMutation = useSwitchSpiderPackageMutation()

  const handleToggle = async (spider_package_enabled: boolean) => {
    await switchMutation
      .mutateAsync({
        spiderPackageId: spiderPackage.spider_package_id,
        data: { spider_package_enabled },
      })
      .then((res) => {
        toast.success(`爬虫包 ${res.spider_package_name} 状态切换成功`)
      })
      .catch((error) => {
        console.error(
          `爬虫包 ${spiderPackage.spider_package_name} 状态切换失败:`,
          error
        )
        toast.error(`爬虫包 ${spiderPackage.spider_package_name} 状态切换失败`)
      })
  }

  return (
    <EntityEnabledSwitch
      checked={spiderPackage.spider_package_enabled}
      onCheckedChange={handleToggle}
      disabled={switchMutation.isPending}
    />
  )
}
