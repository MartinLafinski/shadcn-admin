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
import { IndustryMiniItemCell } from '@/components/smart/cells/industry-mini-item-cell'
import { useIndustriesQuery } from '@/features/industries/api/industries'

const SEARCH_SIZE = Number(import.meta.env.VITE_INDUSTRY_SEARCH_SIZE || 50)

type IndustrySlugComboboxProps = {
  value: string | undefined
  onChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  disabled?: boolean
}

export const IndustrySlugCombobox = React.memo(
  ({
    value,
    onChange,
    placeholder = '选择行业...',
    searchPlaceholder = '搜索行业...',
    disabled = false,
  }: IndustrySlugComboboxProps) => {
    const [keyword, setKeyword] = useState('')
    const [popoverOpen, setPopoverOpen] = useState(false)
    const { data, isLoading } = useIndustriesQuery(
      keyword || undefined,
      1,
      SEARCH_SIZE
    )
    const items = data?.industries ?? []
    const selectedItem = value
      ? items.find((i) => i.industry_slug === value)
      : undefined
    const displayText = value
      ? selectedItem
        ? selectedItem.industry_name
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
                <CommandEmpty>未找到行业</CommandEmpty>
              )}
              {isLoading && <CommandEmpty>加载中...</CommandEmpty>}
              {items.length > 0 && (
                <CommandGroup key={items.length.toString()}>
                  {items.map((ind) => {
                    const selected = value === ind.industry_slug
                    return (
                      <CommandItem
                        key={ind.industry_id.toString()}
                        value={ind.industry_slug}
                        onSelect={() => {
                          onChange(ind.industry_slug)
                          setPopoverOpen(false)
                        }}
                      >
                        <CheckIcon
                          className={cn(
                            'mr-2 h-4 w-4',
                            selected ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        <IndustryMiniItemCell entity={ind} />
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

IndustrySlugCombobox.displayName = 'IndustrySlugCombobox'
