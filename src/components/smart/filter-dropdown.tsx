import { ChevronsUpDownIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { InputGroupAddon, InputGroupButton } from '@/components/ui/input-group'

type FilterOption<T> = {
  value: T
  label: string
  icon?: React.ComponentType<{ className?: string }>
  className?: string
}

type FilterDropdownProps<T> = {
  options: readonly FilterOption<T>[]
  value: T | undefined
  onChange: (value: T | undefined) => void
  placeholder: string
}

export function FilterDropdown<T>({
  options,
  value,
  onChange,
  placeholder,
}: FilterDropdownProps<T>) {
  const selected = options.find((o) => o.value === value)
  return (
    <InputGroupAddon align='inline-start'>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <InputGroupButton
            variant='ghost'
            className={cn('-ml-2 !pr-1.5 text-sm', selected?.className)}
          >
            {selected ? selected.label : placeholder}{' '}
            <ChevronsUpDownIcon className='size-3' />
          </InputGroupButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='start' className='[--radius:0.95rem]'>
          <DropdownMenuItem onClick={() => onChange(undefined)}>
            所有
          </DropdownMenuItem>
          {options.map((item) => (
            <DropdownMenuItem
              key={String(item.value)}
              onClick={() => onChange(item.value)}
              className={item.className}
            >
              {item.label} {item.icon && <item.icon />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </InputGroupAddon>
  )
}
