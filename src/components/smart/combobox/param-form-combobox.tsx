import React, { useState, useMemo, useCallback } from 'react'
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react'
import { cn } from '@/lib/utils.ts'
import { Button } from '@/components/ui/button.tsx'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command.tsx'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover.tsx'
import { ParamFormMiniItemCell } from '@/components/smart/cells/param-form-mini-item-cell'
import { useParamFormsQuery } from '@/features/param-forms/api/param-forms.ts'

const SEARCH_SIZE: number = Number(
  import.meta.env.VITE_PARAMFORM_SEARCH_SIZE || 50
)

type ParamFormComboboxProps = {
  value: string | number | undefined
  onChange: (value: string | number | undefined) => void
  paramType?: string
  placeholder?: string
  searchPlaceholder?: string
  disabled?: boolean
  valueKey?: 'param_form_id' | 'param_form_slug'
}

export const ParamFormCombobox = React.memo(
  ({
    value,
    onChange,
    paramType,
    valueKey = 'param_form_id',
    placeholder = '选择参数要素包...',
    searchPlaceholder = '搜索参数要素包...',
    disabled = false,
  }: ParamFormComboboxProps) => {
    const [keyword, setKeyword] = useState('')
    const [popoverOpen, setPopoverOpen] = useState(false)

    const { data, isLoading } = useParamFormsQuery(
      keyword || undefined,
      undefined,
      paramType,
      1,
      SEARCH_SIZE
    )

    const items = data?.param_forms ?? []

    const selectedItem = useMemo(
      () =>
        valueKey === 'param_form_slug'
          ? items.find((p) => p.param_form_slug === value)
          : items.find((p) => p.param_form_id === value),
      [items, value, valueKey]
    )

    const isItemSelected = useCallback(
      (item: (typeof items)[number]) =>
        valueKey === 'param_form_slug'
          ? value === item.param_form_slug
          : value === item.param_form_id,
      [value, valueKey]
    )

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
            {value
              ? selectedItem
                ? `${selectedItem.param_form_name} [${selectedItem.param_form_slug}]`
                : placeholder
              : placeholder}
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
                <CommandEmpty>未找到参数要素</CommandEmpty>
              )}
              {isLoading && <CommandEmpty>加载中...</CommandEmpty>}
              {items.length > 0 && (
                <CommandGroup key={items.length.toString()}>
                  {items.map((item) => {
                    const selected = isItemSelected(item)
                    const itemValue =
                      valueKey === 'param_form_slug'
                        ? item.param_form_slug
                        : item.param_form_id
                    return (
                      <CommandItem
                        key={item.param_form_id.toString()}
                        value={`${item.param_form_id}`}
                        onSelect={() => {
                          onChange(selected ? undefined : itemValue)
                          setPopoverOpen(false)
                        }}
                      >
                        <CheckIcon
                          className={cn(
                            'mr-2 h-4 w-4',
                            selected ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        <ParamFormMiniItemCell entity={item} />
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

ParamFormCombobox.displayName = 'ParamFormCombobox'
