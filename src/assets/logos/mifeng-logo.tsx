import logoImg from '@/assets/images/1_mifeng.png'
import { cn } from '@/lib/utils.ts'

export function MifengLogo({
  className,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      src={logoImg}
      alt='Mifeng Logo'
      className={cn('size-6', className)}
      {...props}
    />
  )
}
