import logoImg from '@/assets/images/5_fengmi.png'
import { cn } from '@/lib/utils.ts'

export function FengmiLogo({
  className,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      src={logoImg}
      alt='Fengmi Logo'
      className={cn('size-6', className)}
      {...props}
    />
  )
}
