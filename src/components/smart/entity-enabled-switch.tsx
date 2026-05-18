import { Switch } from '@/components/ui/switch'

interface EntityEnabledSwitchProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
}

export function EntityEnabledSwitch({
  checked,
  onCheckedChange,
  disabled,
}: EntityEnabledSwitchProps) {
  return (
    <Switch
      className='data-[state=checked]:bg-green-400 data-[state=unchecked]:bg-red-400 dark:data-[state=checked]:bg-green-700 dark:data-[state=unchecked]:bg-red-700'
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
    />
  )
}
