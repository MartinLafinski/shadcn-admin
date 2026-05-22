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
import { SpiderPackageMiniItemCell } from '@/components/smart/cells/spider-package-mini-item-cell'
import { useSpiderPackagesQuery } from '@/features/spider-packages/api/spider-packages'

const SEARCH_SIZE = Number(
  import.meta.env.VITE_SPIDER_PACKAGE_SEARCH_SIZE || 50
)

type SpiderPackageComboboxProps = {
  value: string | undefined
  onChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  disabled?: boolean
}

export const SpiderPackageCombobox = React.memo(
  ({
    value,
    onChange,
    placeholder = '选择爬虫包...',
    searchPlaceholder = '搜索爬虫包...',
    disabled = false,
  }: SpiderPackageComboboxProps) => {
    const [keyword, setKeyword] = useState('')
    const [popoverOpen, setPopoverOpen] = useState(false)

    const { data, isLoading } = useSpiderPackagesQuery(
      keyword || undefined,
      undefined,
      undefined,
      1,
      SEARCH_SIZE
    )

    const items = data?.spiderPackages ?? []

    const selectedItem = value
      ? items.find((sp) => sp.spider_package_slug === value)
      : undefined

    const displayText = value
      ? selectedItem
        ? `${selectedItem.spider_package_name}`
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
                <CommandEmpty>未找到爬虫包</CommandEmpty>
              )}
              {isLoading && <CommandEmpty>加载中...</CommandEmpty>}
              {items.length > 0 && (
                <CommandGroup key={items.length.toString()}>
                  {items.map((sp) => {
                    const selected = value === sp.spider_package_slug
                    return (
                      <CommandItem
                        key={sp.spider_package_id.toString()}
                        value={sp.spider_package_slug}
                        onSelect={() => {
                          onChange(sp.spider_package_slug)
                          setPopoverOpen(false)
                        }}
                      >
                        <CheckIcon
                          className={cn(
                            'mr-2 h-4 w-4',
                            selected ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        <SpiderPackageMiniItemCell
                          entity={sp}
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

SpiderPackageCombobox.displayName = 'SpiderPackageCombobox'
