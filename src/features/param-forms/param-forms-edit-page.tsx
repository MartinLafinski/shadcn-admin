import { Skeleton } from '@/components/ui/skeleton'
import { useParamFormQuery } from './api/param-forms'
import { ParamFormsEditor } from './components/param-forms-editor'

type ParamFormsEditPageProps = {
  paramFormId: number
}

export function ParamFormsEditPage({ paramFormId }: ParamFormsEditPageProps) {
  const {
    data: initialData,
    isLoading,
    isError,
  } = useParamFormQuery(paramFormId)

  if (isLoading) {
    return (
      <div className='flex h-screen flex-col gap-4 p-8'>
        <Skeleton className='h-8 w-48' />
        <div className='flex gap-4'>
          <Skeleton className='h-10 flex-1' />
          <Skeleton className='h-10 flex-1' />
        </div>
        <div className='flex flex-1 gap-4'>
          <Skeleton className='flex-1' />
          <Skeleton className='flex-1' />
        </div>
      </div>
    )
  }

  if (isError || !initialData) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <p className='text-lg text-red-500'>无法加载参数要素数据</p>
      </div>
    )
  }

  return (
    <ParamFormsEditor
      mode='edit'
      paramFormId={paramFormId}
      initialData={initialData}
    />
  )
}
