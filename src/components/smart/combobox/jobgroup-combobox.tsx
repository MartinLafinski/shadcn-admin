import React, { useState } from 'react'
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { InputGroupButton } from '@/components/ui/input-group'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { JobGroupMiniItemCell } from '@/components/smart/cells/jobgroup-mini-item-cell'
import { useJobGroupsQuery } from '@/features/jobgroups/api/jobgroups'

const SEARCH_SIZE = Number(import.meta.env.VITE_JOBGROUP_SEARCH_SIZE || 50)

type JobGroupComboboxProps = {
  value: number | null | undefined
  onChange: (value: number | null | undefined) => void
  variant?: 'default' | 'inline'
  placeholder?: string
  searchPlaceholder?: string
  disabled?: boolean
}

export const JobGroupCombobox = React.memo(
  ({
    value,
    onChange,
    variant = 'default',
    placeholder = '选择作业分组...',
    searchPlaceholder = '搜索作业分组...',
    disabled = false,
  }: JobGroupComboboxProps) => {
    const [keyword, setKeyword] = useState('')
    const [popoverOpen, setPopoverOpen] = useState(false)

    const { data, isLoading } = useJobGroupsQuery(
      keyword || undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      1,
      SEARCH_SIZE
    )

    const items = data?.jobGroups ?? []

    const selectedItem = value
      ? items.find((jg) => jg.jobgroup_id === value)
      : undefined

    const displayText = value
      ? selectedItem
        ? `${selectedItem.jobgroup_name} [${selectedItem.jobgroup_slug}]`
        : placeholder
      : placeholder

    return (
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          {variant === 'inline' ? (
            <InputGroupButton
              variant='ghost'
              size='sm'
              role='combobox'
              disabled={disabled}
              className={cn(
                '-ml-2 h-6 justify-between text-sm',
                !value && 'text-muted-foreground'
              )}
            >
              {displayText}
              <ChevronsUpDownIcon className='size-3' />
            </InputGroupButton>
          ) : (
            <Button
              variant='outline'
              role='combobox'
              disabled={disabled}
              className={cn(
                'w-full justify-between',
                !value && 'text-muted-foreground'
              )}
            >
              <span className='truncate'>{displayText}</span>
              <ChevronsUpDownIcon className='ml-2 h-4 w-4 shrink-0 opacity-50' />
            </Button>
          )}
        </PopoverTrigger>
        <PopoverContent className='w-full p-0' align='start'>
          <Command shouldFilter={false} className='w-full'>
            <CommandInput
              className='w-full'
              placeholder={searchPlaceholder}
              value={keyword}
              onValueChange={setKeyword}
            />
            <CommandList className='w-full'>
              {!isLoading && items.length === 0 && (
                <CommandEmpty>未找到作业分组</CommandEmpty>
              )}
              {isLoading && <CommandEmpty>加载中...</CommandEmpty>}
              {items.length > 0 && (
                <CommandGroup key={items.length.toString()}>
                  {items.map((jg) => (
                    <CommandItem
                      key={jg.jobgroup_id.toString()}
                      value={`${jg.jobgroup_id}`}
                      onSelect={() => {
                        onChange(
                          value === jg.jobgroup_id ? undefined : jg.jobgroup_id
                        )
                        setPopoverOpen(false)
                      }}
                    >
                      <CheckIcon
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === jg.jobgroup_id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <JobGroupMiniItemCell group={jg} isPrimary={false} />
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    )
  }
)

JobGroupCombobox.displayName = 'JobGroupCombobox'
