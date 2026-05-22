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
import { IndustryMiniItemCell } from '@/components/smart/cells/industry-mini-item-cell'
import { useIndustriesQuery } from '@/features/industries/api/industries'

const SEARCH_SIZE: number = Number(
  import.meta.env.VITE_INDUSTRY_SEARCH_SIZE || 50
)

type IndustryComboboxProps = {
  value: number | null | undefined
  onChange: (value: number | null | undefined) => void
  variant?: 'default' | 'inline'
  placeholder?: string
  searchPlaceholder?: string
  disabled?: boolean
}

export const IndustryCombobox = React.memo(
  ({
    value,
    onChange,
    variant = 'default',
    placeholder = '选择行业...',
    searchPlaceholder = '搜索行业...',
    disabled = false,
  }: IndustryComboboxProps) => {
    const [keyword, setKeyword] = useState('')
    const [popoverOpen, setPopoverOpen] = useState(false)

    const { data, isLoading } = useIndustriesQuery(
      keyword || undefined,
      1,
      SEARCH_SIZE
    )

    const items = data?.industries ?? []
    const selectedItem = items.find((i) => i.industry_id === value)

    const displayText = value
      ? selectedItem
        ? `${selectedItem.industry_name} [${selectedItem.industry_slug}]`
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
                <CommandEmpty>未找到行业</CommandEmpty>
              )}
              {isLoading && <CommandEmpty>加载中...</CommandEmpty>}
              {items.length > 0 && (
                <CommandGroup key={items.length.toString()}>
                  {items.map((industry) => (
                    <CommandItem
                      key={industry.industry_id.toString()}
                      value={`${industry.industry_id}`}
                      onSelect={() => {
                        onChange(
                          value === industry.industry_id
                            ? undefined
                            : industry.industry_id
                        )
                        setPopoverOpen(false)
                      }}
                    >
                      <CheckIcon
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === industry.industry_id
                            ? 'opacity-100'
                            : 'opacity-0'
                        )}
                      />
                      <IndustryMiniItemCell
                        industry={industry}
                        isPrimary={false}
                      />
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

IndustryCombobox.displayName = 'IndustryCombobox'
