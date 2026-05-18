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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { PrejobMiniItemCell } from '@/components/smart/cells/prejob-mini-item-cell'
import { usePrejobsQuery } from '@/features/prejobs/api/prejobs'

const SEARCH_SIZE = Number(import.meta.env.VITE_PREJOB_SEARCH_SIZE || 50)

type PrejobComboboxProps = {
  value: string | undefined
  onChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  disabled?: boolean
}

export const PrejobCombobox = React.memo(
  ({
    value,
    onChange,
    placeholder = '选择预备作业...',
    searchPlaceholder = '搜索预备作业...',
    disabled = false,
  }: PrejobComboboxProps) => {
    const [keyword, setKeyword] = useState('')
    const [popoverOpen, setPopoverOpen] = useState(false)

    const { data, isLoading } = usePrejobsQuery(
      undefined,
      undefined,
      undefined,
      keyword || undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      1,
      SEARCH_SIZE
    )

    const items = data?.prejobs ?? []

    const selectedItem = value
      ? items.find((pj) => pj.prejob_slug === value)
      : undefined

    const displayText = value
      ? selectedItem
        ? `${selectedItem.prejob_name}`
        : value
      : placeholder

    return (
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
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
                <CommandEmpty>未找到预备作业</CommandEmpty>
              )}
              {isLoading && <CommandEmpty>加载中...</CommandEmpty>}
              {items.length > 0 && (
                <CommandGroup key={items.length.toString()}>
                  {items.map((pj) => {
                    const selected = value === pj.prejob_slug
                    return (
                      <CommandItem
                        key={pj.prejob_id.toString()}
                        value={pj.prejob_slug}
                        onSelect={() => {
                          onChange(pj.prejob_slug)
                          setPopoverOpen(false)
                        }}
                      >
                        <CheckIcon
                          className={cn(
                            'mr-2 h-4 w-4',
                            selected ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        <PrejobMiniItemCell entity={pj} />
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    )
  }
)

PrejobCombobox.displayName = 'PrejobCombobox'
