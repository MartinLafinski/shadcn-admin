import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { LogOut, UserIcon, ChevronDown } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.tsx'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SignOutDialog } from '@/components/sign-out-dialog'

export function UserMenu() {
  const user = useAuthStore((s) => s.auth.user)
  const navigate = useNavigate()
  const [showSignOut, setShowSignOut] = useState(false)

  if (!user) return null

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
            <Avatar className='h-8 w-8'>
              <AvatarImage src='/avatars/01.png' alt='@shadcn' />
              <AvatarFallback>
                {user.username?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Button>
          {/*<Button variant='ghost' className='flex items-center gap-2 px-2'>*/}
          {/*  <UserIcon className='h-4 w-4' />*/}
          {/*  <span className='hidden text-sm sm:inline'>{user.username}</span>*/}
          {/*  <ChevronDown className='h-3 w-3 text-muted-foreground' />*/}
          {/*</Button>*/}
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-48'>
          <div className='px-2 py-1.5'>
            <p className='text-sm font-medium'>{user.username}</p>
            <p className='text-xs text-muted-foreground'>{user.email}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate({ to: '/accounts/me' })}>
            <UserIcon className='mr-2 h-4 w-4' />
            我的资料
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className='text-red-600'
            onClick={() => setShowSignOut(true)}
          >
            <LogOut className='mr-2 h-4 w-4' />
            登出
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SignOutDialog open={showSignOut} onOpenChange={setShowSignOut} />
    </>
  )
}
