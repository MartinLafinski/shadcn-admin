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
import { WebsiteMiniItemCell } from '@/components/smart/cells/website-mini-item-cell'
import { useWebsitesQuery } from '@/features/websites/api/websites'

const SEARCH_SIZE = Number(import.meta.env.VITE_WEBSITE_SEARCH_SIZE || 50)

type WebsiteSlugComboboxProps = {
  value: string | undefined
  onChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  disabled?: boolean
}

export const WebsiteSlugCombobox = React.memo(
  ({
    value,
    onChange,
    placeholder = '选择网站...',
    searchPlaceholder = '搜索网站...',
    disabled = false,
  }: WebsiteSlugComboboxProps) => {
    const [keyword, setKeyword] = useState('')
    const [popoverOpen, setPopoverOpen] = useState(false)
    const { data, isLoading } = useWebsitesQuery(
      keyword || undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      1,
      SEARCH_SIZE
    )
    const items = data?.websites ?? []
    const selectedItem = value
      ? items.find((w) => w.website_slug === value)
      : undefined
    const displayText = value
      ? selectedItem
        ? selectedItem.website_name
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
                <CommandEmpty>未找到网站</CommandEmpty>
              )}
              {isLoading && <CommandEmpty>加载中...</CommandEmpty>}
              {items.length > 0 && (
                <CommandGroup key={items.length.toString()}>
                  {items.map((ws) => {
                    const selected = value === ws.website_slug
                    return (
                      <CommandItem
                        key={ws.website_id.toString()}
                        value={ws.website_slug}
                        onSelect={() => {
                          onChange(ws.website_slug)
                          setPopoverOpen(false)
                        }}
                      >
                        <CheckIcon
                          className={cn(
                            'mr-2 h-4 w-4',
                            selected ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        <WebsiteMiniItemCell website={ws} />
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

WebsiteSlugCombobox.displayName = 'WebsiteSlugCombobox'
