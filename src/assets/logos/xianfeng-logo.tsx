import logoImg from '@/assets/images/logo_xianfeng.png'
import { cn } from '@/lib/utils.ts'

export function XianfengLogo({
  className,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      src={logoImg}
      alt='Xianfeng Logo'
      className={cn('size-6', className)}
      {...props}
    />
  )
}
