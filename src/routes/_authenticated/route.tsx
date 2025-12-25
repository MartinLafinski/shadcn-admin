// 示例：src/routes/_authenticated/route.tsx
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'

export const Route = createFileRoute('/_authenticated')({
  component: () => (
    <>
      <SignedIn>
        <AuthenticatedLayout>
          <Outlet />
        </AuthenticatedLayout>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  ),
})