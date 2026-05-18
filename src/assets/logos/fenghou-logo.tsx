import logoImg from '@/assets/images/6_fenghou.png'
import { cn } from '@/lib/utils.ts'

export function FenghouLogo({
  className,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      src={logoImg}
      alt='Fenghou Logo'
      className={cn('size-6', className)}
      {...props}
    />
  )
}
