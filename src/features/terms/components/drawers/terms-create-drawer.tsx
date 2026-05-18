import React, { useLayoutEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { githubLight, githubDark } from '@uiw/codemirror-theme-github'
import CodeMirror from '@uiw/react-codemirror'
import MDEditor from '@uiw/react-md-editor'
import { Maximize2Icon, Minimize2Icon } from 'lucide-react'
import { toast } from 'sonner'
import { useTheme } from '@/context/theme-provider.tsx'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useCreateTermMutation } from '../../api/terms'
import { TermCreateSchema, type TermCreateData } from '../../data/schemas'

type TermCreateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function TermCreateDrawerContent({
  open,
  onOpenChange,
}: TermCreateDrawerProps) {
  const { resolvedTheme } = useTheme()
  const [isFullscreen, setIsFullscreen] = useState(false)

  const [showEditors, setShowEditors] = useState(false)
  useLayoutEffect(() => {
    if (open) {
      const raf = requestAnimationFrame(() => setShowEditors(true))
      return () => cancelAnimationFrame(raf)
    }
    setShowEditors(false)
  }, [open])

  const createTermMutation = useCreateTermMutation()

  const form = useForm<TermCreateData>({
    resolver: zodResolver(TermCreateSchema),
    defaultValues: {
      term_name: '',
      term_slug: '',
      term_collection: [],
      term_readme: '',
    },
  })

  const onSubmit = async (data: TermCreateData) => {
    await createTermMutation
      .mutateAsync(data)
      .then((res) => {
        toast.success(`术语库 ${res.term_name} 创建成功`)
      })
      .catch((error) => {
        console.error('术语库创建失败:', error)
        toast.error('术语库创建失败')
      })
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='flex min-w-1/3 flex-col'>
        <SheetHeader className='text-start'>
          <SheetTitle>创建术语库</SheetTitle>
          <SheetDescription>创建新的术语库</SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            id='term-create-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 space-y-6 overflow-y-auto px-4'
          >
            <h4 className='text-sm font-bold'>基础设置</h4>
            <FormField
              control={form.control}
              name='term_name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    术语库名称 <span className='text-destructive'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='术语库名称(强调可读性)' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='term_slug'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    术语标识 <span className='text-destructive'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder='术语标识(字母、数字、连字符或下划线)'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {showEditors && (
              <>
                <h4 className='text-sm font-bold'>术语集合</h4>
                <FormField
                  control={form.control}
                  name='term_collection'
                  render={({ field }) => (
                    <FormItem
                      className={
                        isFullscreen
                          ? 'fixed inset-0 z-50 m-0 flex !h-screen !w-screen flex-col overflow-hidden rounded-none border-0 bg-background'
                          : ''
                      }
                    >
                      <div className='flex flex-shrink-0 items-center justify-between'>
                        <FormLabel className='text-sm font-bold'>
                          术语集合 (每行一个术语)
                        </FormLabel>
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
                      <FormControl>
                        <CodeMirror
                          value={(field.value ?? []).join('\n')}
                          onChange={(value) => {
                            const lines = value.split('\n')
                            const filteredLines = lines.filter(
                              (item, index) => {
                                if (item.trim() !== '') return true
                                if (index === lines.length - 1) return true
                                return false
                              }
                            )
                            field.onChange(filteredLines)
                          }}
                          theme={
                            resolvedTheme === 'light' ? githubLight : githubDark
                          }
                          height={isFullscreen ? '100%' : '200px'}
                          minHeight='200px'
                        />
                      </FormControl>
                      <FormMessage className='flex-shrink-0' />
                    </FormItem>
                  )}
                />

                <h4 className='text-sm font-bold'>说明文档</h4>
                <FormField
                  control={form.control}
                  name='term_readme'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='pb-2 text-sm font-bold'>
                        术语库说明 (Markdown)
                      </FormLabel>
                      <FormControl data-color-mode={resolvedTheme}>
                        <MDEditor
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </form>
        </Form>
        <SheetFooter className='gap-2'>
          <SheetClose asChild>
            <Button variant='outline'>关闭</Button>
          </SheetClose>
          <Button form='term-create-form' type='submit'>
            创建术语库
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export const TermCreateDrawer = React.memo(TermCreateDrawerContent)
