import React from 'react'
import { Link } from '@tanstack/react-router'
import { SquareCheckBigIcon, SquareXIcon } from 'lucide-react'
import type { MiniParamFormData } from '@/lib/base-schemas'
import { cn } from '@/lib/utils'
import type { ParamFormItemData } from '@/features/param-forms/data/schemas'

interface ParamFormMiniItemCellProps {
  entity: ParamFormItemData | MiniParamFormData | null | undefined
  asLink?: boolean
  className?: string
}

export const ParamFormMiniItemCell = React.memo(
  ({ entity, asLink, className }: ParamFormMiniItemCellProps) => {
    if (!entity) {
      return <span>-</span>
    }

    const entityClassName = asLink || 'font-semibold'

    const content = (
      <div
        className={cn(
          'mx-0 flex flex-col items-start gap-0.5 px-0 font-normal',
          className
        )}
      >
        <span
          className={cn(
            'text-sm',
            asLink && 'underline decoration-dotted underline-offset-5',
            entity.param_form_enabled
              ? 'decoration-green-500'
              : 'decoration-red-500',
            entityClassName
          )}
        >
          {entity.param_form_name}
        </span>
        <p className='flex flex-row items-center gap-1'>
          {entity.param_form_enabled ? (
            <SquareCheckBigIcon className='h-3.5 w-3.5 text-green-400 dark:text-green-700' />
          ) : (
            <SquareXIcon className='h-3.5 w-3.5 text-red-400 dark:text-red-800' />
          )}
          <code className='text-xs text-muted-foreground'>
            [{entity.param_form_slug}]
          </code>
        </p>
      </div>
    )

    if (!asLink) {
      return content
    }

    return (
      <Link
        to={`/param-forms/edit` as any}
        search={{ paramFormId: entity.param_form_id } as any}
        target='_blank'
      >
        {content}
      </Link>
    )
  }
)

ParamFormMiniItemCell.displayName = 'ParamFormMiniItemCell'
