import { type UseFormReturn } from 'react-hook-form'
import MDEditor from '@uiw/react-md-editor'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

interface ConfigReadmeFieldProps {
  form: UseFormReturn<Record<string, unknown>>
  name: string
  label: string
  resolvedTheme: string
}

export function ConfigReadmeField({
  form,
  name,
  label,
  resolvedTheme,
}: ConfigReadmeFieldProps) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className='text-sm font-bold'>{label}</FormLabel>
          <FormControl data-color-mode={resolvedTheme}>
            <MDEditor value={field.value as string} onChange={field.onChange} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
