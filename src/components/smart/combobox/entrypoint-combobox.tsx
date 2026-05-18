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
import { EntrypointMiniItemCell } from '@/components/smart/cells/entrypoint-mini-item-cell'
import { useEntrypointsQuery } from '@/features/entrypoints/api/entrypoints'

const SEARCH_SIZE = Number(import.meta.env.VITE_ENTRYPOINT_SEARCH_SIZE || 50)

type EntrypointComboboxProps = {
  value: string | undefined
  onChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  disabled?: boolean
}

export const EntrypointCombobox = React.memo(
  ({
    value,
    onChange,
    placeholder = '选择入口点...',
    searchPlaceholder = '搜索入口点...',
    disabled = false,
  }: EntrypointComboboxProps) => {
    const [keyword, setKeyword] = useState('')
    const [popoverOpen, setPopoverOpen] = useState(false)

    const { data, isLoading } = useEntrypointsQuery(
      undefined,
      undefined,
      keyword || undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      1,
      SEARCH_SIZE
    )

    const items = data?.entrypoints ?? []

    const selectedItem = value
      ? items.find((ep) => ep.entrypoint_slug === value)
      : undefined

    const displayText = value
      ? selectedItem
        ? `${selectedItem.entrypoint_name}`
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
                <CommandEmpty>未找到入口点</CommandEmpty>
              )}
              {isLoading && <CommandEmpty>加载中...</CommandEmpty>}
              {items.length > 0 && (
                <CommandGroup key={items.length.toString()}>
                  {items.map((ep) => {
                    const selected = value === ep.entrypoint_slug
                    return (
                      <CommandItem
                        key={ep.entrypoint_id.toString()}
                        value={ep.entrypoint_slug}
                        onSelect={() => {
                          onChange(ep.entrypoint_slug)
                          setPopoverOpen(false)
                        }}
                      >
                        <CheckIcon
                          className={cn(
                            'mr-2 h-4 w-4',
                            selected ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        <EntrypointMiniItemCell entrypoint={ep} />
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

EntrypointCombobox.displayName = 'EntrypointCombobox'
