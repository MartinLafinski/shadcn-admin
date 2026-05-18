import React, { useState, useLayoutEffect } from 'react'
import { type UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

interface ConfigSheetProps<T extends Record<string, unknown>> {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: React.ReactNode
  formId: string
  submitLabel: string
  form: UseFormReturn<T>
  onSubmit: (data: T) => Promise<void>
  isPending?: boolean
  children: (ctx: { showContent: boolean }) => React.ReactNode
}

export function ConfigSheet<T extends Record<string, unknown>>({
  open,
  onOpenChange,
  title,
  description,
  formId,
  submitLabel,
  form,
  onSubmit,
  isPending = false,
  children,
}: ConfigSheetProps<T>) {
  const [showContent, setShowContent] = useState(false)

  useLayoutEffect(() => {
    if (open) {
      const raf = requestAnimationFrame(() => setShowContent(true))
      return () => cancelAnimationFrame(raf)
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShowContent(false)
  }, [open])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='flex min-w-1/3 flex-col'>
        <SheetHeader className='text-start'>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            id={formId}
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 overflow-y-auto px-4'
          >
            {children({ showContent })}
          </form>
        </Form>
        <SheetFooter className='gap-2'>
          <SheetClose asChild>
            <Button variant='outline'>关闭</Button>
          </SheetClose>
          <Button form={formId} type='submit' disabled={isPending}>
            {submitLabel}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
