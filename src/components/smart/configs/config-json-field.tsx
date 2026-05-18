import React from 'react'
import { type UseFormReturn } from 'react-hook-form'
import { json } from '@codemirror/lang-json'
import { EditorView } from '@codemirror/view'
import { githubLight, githubDark } from '@uiw/codemirror-theme-github'
import CodeMirror from '@uiw/react-codemirror'
import { JsonEditor, githubDarkTheme, githubLightTheme } from 'json-edit-react'
import { Maximize2Icon, Minimize2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

interface ConfigJsonFieldProps {
  form: UseFormReturn<Record<string, unknown>>
  name: string
  label: string
  resolvedTheme: string
}

export function ConfigJsonField({
  form,
  name,
  label,
  resolvedTheme,
}: ConfigJsonFieldProps) {
  const [isFullscreen, setIsFullscreen] = React.useState(false)

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem
          className={
            isFullscreen
              ? 'fixed inset-0 z-50 m-0 flex !h-screen !w-screen flex-col overflow-hidden rounded-none border-0 bg-background'
              : ''
          }
        >
          <div className='flex flex-shrink-0 items-center justify-between'>
            <FormLabel className='text-sm font-bold'>{label}</FormLabel>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={() => setIsFullscreen(!isFullscreen)}
              className='h-8 w-8 p-0'
            >
              {isFullscreen ? (
                <Minimize2Icon className='h-4 w-4' />
              ) : (
                <Maximize2Icon className='h-4 w-4' />
              )}
            </Button>
          </div>
          <FormControl className='dark:[&_textarea]:!text-white1 min-h-0 flex-1 overflow-y-auto'>
            <JsonEditor
              data={field.value}
              setData={field.onChange}
              rootFontSize={13}
              theme={
                resolvedTheme === 'light' ? githubLightTheme : githubDarkTheme
              }
              minWidth={isFullscreen ? '100%' : '100%'}
              maxWidth={isFullscreen ? '100%' : '100%'}
              TextEditor={(props) => {
                return (
                  <CodeMirror
                    {...props}
                    theme={resolvedTheme === 'light' ? githubLight : githubDark}
                    extensions={[json(), EditorView.lineWrapping]}
                    height={isFullscreen ? '100%' : 'auto'}
                  />
                )
              }}
            />
          </FormControl>
          <FormMessage className='flex-shrink-0' />
        </FormItem>
      )}
    />
  )
}
