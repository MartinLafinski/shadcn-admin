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
import { WebsiteMiniItemCell } from '@/components/smart/cells/website-mini-item-cell.tsx'
import { useWebsitesQuery } from '@/features/websites/api/websites'

const SEARCH_SIZE: number = Number(
  import.meta.env.VITE_WEBSITE_SEARCH_SIZE || 50
)

type WebsiteComboboxProps = {
  value: number | null | undefined
  onChange: (value: number | null | undefined) => void
  variant?: 'default' | 'inline'
  placeholder?: string
  searchPlaceholder?: string
  disabled?: boolean
}

export const WebsiteCombobox = React.memo(
  ({
    value,
    onChange,
    variant = 'default',
    placeholder = '选择网站...',
    searchPlaceholder = '搜索网站...',
    disabled = false,
  }: WebsiteComboboxProps) => {
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
    const selectedItem = items.find((w) => w.website_id === value)

    const displayText = value
      ? selectedItem
        ? `${selectedItem.website_name} [${selectedItem.website_slug}]`
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
              {displayText}
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
                <CommandEmpty>未找到网站</CommandEmpty>
              )}
              {isLoading && <CommandEmpty>加载中...</CommandEmpty>}
              {items.length > 0 && (
                <CommandGroup key={items.length.toString()}>
                  {items.map((website) => (
                    <CommandItem
                      key={website.website_id.toString()}
                      value={`${website.website_id}`}
                      onSelect={() => {
                        onChange(
                          value === website.website_id
                            ? undefined
                            : website.website_id
                        )
                        setPopoverOpen(false)
                      }}
                    >
                      <CheckIcon
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === website.website_id
                            ? 'opacity-100'
                            : 'opacity-0'
                        )}
                      />
                      <WebsiteMiniItemCell website={website} asLink={true} />
                      {/*<span className='font-semibold'>*/}
                      {/*  {website.website_name}*/}
                      {/*</span>*/}
                      {/*<span className='ml-2 text-xs text-muted-foreground'>*/}
                      {/*  [{website.website_slug}]*/}
                      {/*</span>*/}
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

WebsiteCombobox.displayName = 'WebsiteCombobox'
