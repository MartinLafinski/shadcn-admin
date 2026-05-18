import {
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '../components/ui/dropdown-menu'
import { enableLabels } from './labels'

export function renderToggleSubMenu(
  title: string,
  labels: typeof enableLabels,
  currentValue: boolean,
  onToggle: (value: any) => void
) {
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>{title}</DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        <DropdownMenuRadioGroup value={String(currentValue)}>
          {labels.map((label) => {
            // const isCurrent = label.value === currentValue
            return (
              <DropdownMenuRadioItem
                key={label.label}
                value={label.value.toString()}
                // disabled={isCurrent}
                onClick={() => onToggle(label.value)}
                // className={isCurrent ? label.className : ''}
              >
                {/*<span className={isCurrent ? label.className : ''}>{label.label}</span>*/}
                {/*<DropdownMenuShortcut>*/}
                {/*  <label.icon className={isCurrent ? label.className : ''} />*/}
                {/*</DropdownMenuShortcut>*/}
                <span className={label.className}>{label.label}</span>
                <DropdownMenuShortcut>
                  <label.icon className={label.className} />
                </DropdownMenuShortcut>
              </DropdownMenuRadioItem>
            )
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  )
}
