import logoImg from '@/assets/images/8_fengchao.png'
import { cn } from '@/lib/utils.ts'

export function FengchaoLogo({
  className,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      src={logoImg}
      alt='Fengchao Logo'
      className={cn('size-6', className)}
      {...props}
    />
  )
}
