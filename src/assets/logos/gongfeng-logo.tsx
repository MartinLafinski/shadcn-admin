import logoImg from '@/assets/images/3_gongfeng.png'
import { cn } from '@/lib/utils.ts'

export function GongfengLogo({
  className,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      src={logoImg}
      alt='Gongfeng Logo'
      className={cn('size-6', className)}
      {...props}
    />
  )
}
