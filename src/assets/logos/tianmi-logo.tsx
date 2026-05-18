import logoImg from '@/assets/images/11_tianmi.png'
import { cn } from '@/lib/utils.ts'

export function TianmiLogo({
  className,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      src={logoImg}
      alt='Tianmi Logo'
      className={cn('size-6', className)}
      {...props}
    />
  )
}
