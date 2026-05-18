import logoImg from '@/assets/images/9_fengqun.png'
import { cn } from '@/lib/utils.ts'

export function FengqunLogo({
  className,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      src={logoImg}
      alt='Fengqun Logo'
      className={cn('size-6', className)}
      {...props}
    />
  )
}
