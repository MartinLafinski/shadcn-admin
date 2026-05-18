export function EntitySpiderTaskBarHeader() {
  return (
    <div className='flex items-center gap-3 text-sm text-muted-foreground'>
      <div className='flex items-center gap-1'>
        <div className='h-2 w-2 rounded-full bg-cyan-500' />
        <span>总任务</span>
      </div>
      <div className='flex items-center gap-1'>
        <div className='h-2 w-2 rounded-full bg-green-500' />
        <span>成功</span>
      </div>
      <div className='flex items-center gap-1'>
        <div className='h-2 w-2 rounded-full bg-red-500' />
        <span>失败</span>
      </div>
      <div className='flex items-center gap-1'>
        <div className='h-2 w-2 rounded-full bg-yellow-500' />
        <span>中断</span>
      </div>
      <div className='flex items-center gap-1'>
        <div className='h-2 w-2 rounded-full bg-gray-400' />
        <span>取消</span>
      </div>
    </div>
  )
}
