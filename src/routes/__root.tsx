// src/routes/__root.tsx
import { type QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Toaster } from '@/components/ui/sonner'
import { NavigationProgress } from '@/components/navigation-progress'
import { GeneralError } from '@/features/errors/general-error'
import { NotFoundError } from '@/features/errors/not-found-error'

import { ClerkProvider } from '@clerk/clerk-react'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: () => {
    if (!PUBLISHABLE_KEY) {
      // 可重用你现有的 MissingClerkPubKey UI，或简单返回 null/提示
      return <div>Missing Clerk publishable key</div>
    }
    return (
      <ClerkProvider
        publishableKey={PUBLISHABLE_KEY}
        afterSignOutUrl='/sign-in'
        signInUrl='/sign-in'
        signUpUrl='/sign-up'
        signInFallbackRedirectUrl='/'
        signUpFallbackRedirectUrl='/'
      >
        <NavigationProgress />
        <Outlet />
        <Toaster duration={5000} />
        {import.meta.env.MODE === 'development' && (
          <>
            <ReactQueryDevtools buttonPosition='bottom-left' />
            <TanStackRouterDevtools position='bottom-right' />
          </>
        )}
      </ClerkProvider>
    )
  },
  notFoundComponent: NotFoundError,
  errorComponent: GeneralError,
})