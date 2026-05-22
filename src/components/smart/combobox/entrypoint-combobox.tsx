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
import { EntrypointMiniItemCell } from '@/components/smart/cells/entrypoint-mini-item-cell'
import { useEntrypointsQuery } from '@/features/entrypoints/api/entrypoints'

const SEARCH_SIZE = Number(import.meta.env.VITE_ENTRYPOINT_SEARCH_SIZE || 50)

type EntrypointComboboxProps = {
  value: number | null | undefined | string
  onChange: (value: number | null | undefined | string) => void
  mode?: 'slug' | 'id'
  variant?: 'default' | 'inline'
  websiteId?: number | null
  industryId?: number | null
  placeholder?: string
  searchPlaceholder?: string
  disabled?: boolean
}

export const EntrypointCombobox = React.memo(
  ({
    value,
    onChange,
    mode = 'slug',
    variant = 'default',
    websiteId,
    industryId,
    placeholder = '选择入口点...',
    searchPlaceholder = '搜索入口点...',
    disabled = false,
  }: EntrypointComboboxProps) => {
    const [keyword, setKeyword] = useState('')
    const [popoverOpen, setPopoverOpen] = useState(false)

    const { data, isLoading } = useEntrypointsQuery(
      websiteId ?? undefined,
      industryId ?? undefined,
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

    const selectedItem =
      mode === 'id'
        ? items.find((ep) => ep.entrypoint_id === value)
        : items.find((ep) => ep.entrypoint_slug === value)

    const displayText = value
      ? selectedItem
        ? mode === 'id'
          ? `${selectedItem.entrypoint_name} [${selectedItem.entrypoint_slug}]`
          : selectedItem.entrypoint_name
        : placeholder
      : placeholder

    const isSelected = (ep: (typeof items)[number]) =>
      mode === 'id' ? value === ep.entrypoint_id : value === ep.entrypoint_slug

    const handleSelect = (ep: (typeof items)[number]) => {
      onChange(
        mode === 'id'
          ? value === ep.entrypoint_id
            ? undefined
            : ep.entrypoint_id
          : ep.entrypoint_slug
      )
      setPopoverOpen(false)
    }

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
                <CommandEmpty>未找到入口点</CommandEmpty>
              )}
              {isLoading && <CommandEmpty>加载中...</CommandEmpty>}
              {items.length > 0 && (
                <CommandGroup key={items.length.toString()}>
                  {items.map((ep) => {
                    const selected = isSelected(ep)
                    return (
                      <CommandItem
                        key={ep.entrypoint_id.toString()}
                        value={
                          mode === 'id'
                            ? `${ep.entrypoint_id}`
                            : ep.entrypoint_slug
                        }
                        onSelect={() => handleSelect(ep)}
                      >
                        <CheckIcon
                          className={cn(
                            'mr-2 h-4 w-4',
                            selected ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        <EntrypointMiniItemCell
                          entrypoint={ep}
                          isPrimary={false}
                        />
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
