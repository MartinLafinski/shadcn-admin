import * as React from 'react'
import { GripVerticalIcon } from 'lucide-react'
import {
  Group,
  Panel,
  Separator,
  type GroupProps,
  type PanelProps,
  type SeparatorProps,
} from 'react-resizable-panels'
import { cn } from '@/lib/utils'

function ResizablePanelGroup({ className, ...props }: GroupProps) {
  return (
    <Group
      data-slot='resizable-panel-group'
      className={cn(
        'flex h-full w-full',
        props.orientation === 'vertical' && 'flex-col',
        className
      )}
      {...props}
    />
  )
}

function ResizablePanel({ ...props }: PanelProps) {
  return <Panel data-slot='resizable-panel' {...props} />
}

function ResizableHandle({
  withHandle,
  orientation,
  className,
  ...props
}: SeparatorProps & {
  withHandle?: boolean
  orientation?: 'horizontal' | 'vertical'
}) {
  return (
    <Separator
      data-slot='resizable-handle'
      className={cn(
        'relative flex items-center justify-center bg-border',
        'focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:outline-none',
        orientation === 'horizontal'
          ? 'h-px w-full after:absolute after:inset-x-0 after:top-1/2 after:h-1 after:-translate-y-1/2'
          : 'w-px after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2',
        withHandle && 'w-1.5',
        className
      )}
      {...props}
    >
      {withHandle && (
        <div
          className={cn(
            'z-10 flex items-center justify-center rounded-sm border bg-border',
            orientation === 'horizontal'
              ? 'h-3 w-4 [&>svg]:rotate-90'
              : 'h-4 w-3'
          )}
        >
          <GripVerticalIcon className='h-2.5 w-2.5' />
        </div>
      )}
    </Separator>
  )
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
