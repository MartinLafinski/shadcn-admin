import { toast } from 'sonner'
import { EntityEnabledSwitch } from '@/components/smart/entity-enabled-switch'
import { useSwitchJobGroupMutation } from '@/features/jobgroups/api/jobgroups'
import { type JobGroupItemData } from '@/features/jobgroups/data/schemas'

export function JobGroupEnabledSwitch({
  jobGroup,
}: {
  jobGroup: JobGroupItemData
}) {
  const switchMutation = useSwitchJobGroupMutation()

  const handleToggle = async (jobgroup_enabled: boolean) => {
    await switchMutation
      .mutateAsync({ id: jobGroup.jobgroup_id, data: { jobgroup_enabled } })
      .then((res) => {
        toast.success(`作业分组 ${res.jobgroup_name} 状态切换成功`)
      })
      .catch((error) => {
        console.error(`作业分组 ${jobGroup.jobgroup_name} 状态切换失败:`, error)
        toast.error(`作业分组 ${jobGroup.jobgroup_name} 状态切换失败`)
      })
  }

  return (
    <EntityEnabledSwitch
      checked={jobGroup.jobgroup_enabled}
      onCheckedChange={handleToggle}
      disabled={switchMutation.isPending}
    />
  )
}
