import logoImg from '@/assets/images/13_fengyong.png'
import { cn } from '@/lib/utils.ts'

export function YoufengLogo({
  className,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      src={logoImg}
      alt='Youfeng Logo'
      className={cn('size-6', className)}
      {...props}
    />
  )
}
