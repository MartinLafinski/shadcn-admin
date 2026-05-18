import logoImg from '@/assets/images/10_fengfang.png'
import { cn } from '@/lib/utils.ts'

export function FengfangLogo({
  className,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      src={logoImg}
      alt='Fengfang Logo'
      className={cn('size-6', className)}
      {...props}
    />
  )
}
