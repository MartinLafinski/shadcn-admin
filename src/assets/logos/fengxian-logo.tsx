import logoImg from '@/assets/images/12_fengxian.png'
import { cn } from '@/lib/utils.ts'

export function FengxianLogo({
  className,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      src={logoImg}
      alt='Fengxian Logo'
      className={cn('size-6', className)}
      {...props}
    />
  )
}
