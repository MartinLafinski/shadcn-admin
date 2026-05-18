import { ToggleLeftIcon, ToggleRightIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge.tsx'
import { EntityLimitedCell } from '@/components/smart/cells/entity-limited-cell'
import { EntityLockedCell } from '@/components/smart/cells/entity-locked-cell'
import { EntityPausedCell } from '@/components/smart/cells/entity-paused-cell'
import { type PrejobData } from '@/features/prejobs/data/schemas'

interface PrejobApplyStatusCellProps {
  prejob: PrejobData
}

export const PrejobApplyStatusCell = ({
  prejob,
}: PrejobApplyStatusCellProps) => {
  let jobClassName = 'bg-black'
  let applyStatus = '未知'
  const canApply = !!prejob.can_apply

  if (canApply) {
    jobClassName = 'bg-green-600'
    applyStatus = '可申请'
  } else if (!prejob.has_enabled) {
    jobClassName = 'bg-red-600'
    applyStatus = '禁止'
  } else if (prejob.has_locked) {
    jobClassName = 'bg-yellow-600'
    applyStatus = '锁定'
  } else if (prejob.has_paused) {
    jobClassName = 'bg-violet-500'
    applyStatus = '暂停'
  } else if (prejob.has_limited) {
    jobClassName = 'bg-stone-700'
    applyStatus = '受限'
  } else if (!canApply) {
    applyStatus = '超限'
  }

  return (
    <div className='flex flex-col items-start gap-1'>
      <Badge
        variant='ghost'
        className={`${jobClassName} w-16 justify-center rounded-sm py-0 text-base text-white`}
      >
        {applyStatus}
      </Badge>
      <div className='flex items-center gap-1'>
        {prejob.has_enabled ? (
          <ToggleRightIcon className='h-4 w-4 text-green-600' />
        ) : (
          <ToggleLeftIcon className='h-4 w-4 text-red-600' />
        )}
        <EntityLockedCell
          entity_type='prejob'
          entity={prejob}
          has_locked={prejob.has_locked}
        />
        <EntityPausedCell
          entity_type='prejob'
          entity={prejob}
          has_paused={prejob.has_paused}
        />
        <EntityLimitedCell
          entity_type='prejob'
          entity={prejob}
          has_limited={prejob.has_limited}
        />
      </div>
    </div>
  )
}
