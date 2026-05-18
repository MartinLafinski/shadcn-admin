import logoImg from '@/assets/images/4_fengwangjiang.png'
import { cn } from '@/lib/utils.ts'

export function FengwangjiangLogo({
  className,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      src={logoImg}
      alt='Fengwangjiang Logo'
      className={cn('size-6', className)}
      {...props}
    />
  )
}
