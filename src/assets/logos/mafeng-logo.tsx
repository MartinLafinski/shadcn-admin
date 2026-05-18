import logoImg from '@/assets/images/7_mafeng2.png'
import { cn } from '@/lib/utils.ts'

export function MafengLogo({
  className,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      src={logoImg}
      alt='Mafeng Logo'
      className={cn('size-6', className)}
      {...props}
    />
  )
}
