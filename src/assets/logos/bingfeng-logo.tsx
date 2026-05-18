import logoImg from '@/assets/images/2_bingfeng.png'
import { cn } from '@/lib/utils.ts'

export function BingfengLogo({
  className,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      src={logoImg}
      alt='Bingfeng Logo'
      className={cn('size-6', className)}
      {...props}
    />
  )
}
