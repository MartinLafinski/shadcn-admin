### 结论概览
你这个项目已经在 `src/routes/clerk` 里集成了 Clerk（`ClerkProvider`、`SignIn/SignUp` 页面、以及一个示例的受保护页面 `user-management.tsx`）。要将“每个页面的用户鉴权完全交给 Clerk 处理”，最简洁、可维护的做法是：

- 把 `ClerkProvider` 上移到全局根路由（`src/routes/__root.tsx`），让整个应用都在 Clerk 上下文里。
- 用一个“受保护布局路由”把需要登录才能访问的所有页面包起来，借助 Clerk 的 `SignedIn`/`SignedOut`/`RedirectToSignIn` 组件实现页面级访问控制。
- 页面内获取用户/令牌统一使用 Clerk 的 `useAuth`/`useUser`/`getToken`，移除你自建的 `auth-store` 和本地 `cookie` 令牌逻辑。

下面给出分步迁移指导与代码示例。

---

### 第 1 步：在根路由包裹 ClerkProvider
当前 `ClerkProvider` 在 `src/routes/clerk/route.tsx` 下，只覆盖 `/clerk` 路由树。如果你想让“所有页面”都走 Clerk 鉴权，建议把它移动到根路由 `src/routes/__root.tsx` 中（或者在应用最顶层挂载处）。示例：

```tsx
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
```

- `.env` 中需要有 `VITE_CLERK_PUBLISHABLE_KEY`（项目里已有 `.env.example` 提示）。
- 一旦上移到根路由，你可以删除/精简 `src/routes/clerk/route.tsx`，或保留其中的 UI 提示作为开发时兜底。

---

### 第 2 步：用受保护“布局路由”统一控制访问
Clerk 提供 `SignedIn`、`SignedOut` 和 `RedirectToSignIn` 组件。建议新建一个顶层受保护路由，把所有需要登录的页面作为它的子路由，这样不需要每个页面都手写鉴权判断。

```tsx
// 示例：src/routes/_authenticated/route.tsx
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react'

export const Route = createFileRoute('/_authenticated')({
  component: () => (
    <>
      <SignedIn>
        {/* 这里可以放你的 AuthenticatedLayout，也可以只放 Outlet */}
        <Outlet />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  ),
})
```

- 然后把所有“必须登录”的页面（例如你的用户管理、仪表盘、设置等）都放到 `/_authenticated` 的子路由下面。
- 若你已有 `AuthenticatedLayout`（项目有 `src/components/layout/authenticated-layout`），可以在 `SignedIn` 内包裹该布局再放 `Outlet`：

```tsx
<SignedIn>
  <AuthenticatedLayout>
    <Outlet />
  </AuthenticatedLayout>
</SignedIn>
```

- 对于“公开页面”（例如营销页、登录注册页），保持在 `/_authenticated` 之外即可。

对比你现在的实现：
- 你在 `src/routes/clerk/_authenticated/user-management.tsx` 里手动用 `useAuth()` 判断 `isSignedIn`，不再需要。把该页面移动至新的 `/_authenticated` 子路由下，去掉手写判断。

---

### 第 3 步：将登录/注册页放到公共路由
沿用现有的 `src/routes/clerk/(auth)/sign-in.tsx` 与 `sign-up.tsx` 也可以，只要它们不在 `/_authenticated` 下面即可。你也可以把它们“上移”为更短路径，例如 `/sign-in`、`/sign-up`：

```tsx
// src/routes/(auth)/sign-in.tsx
import { createFileRoute } from '@tanstack/react-router'
import { SignIn } from '@clerk/clerk-react'

export const Route = createFileRoute('/(auth)/sign-in')({
  component: () => <SignIn />,
})
```

> 记得同步更新 `ClerkProvider` 的 `signInUrl`/`signUpUrl`/`afterSignOutUrl` 等路径。

---

### 第 4 步：页面内用 Clerk Hooks 获取用户与令牌
- 获取登录状态、用户信息：

```tsx
import { useAuth, useUser } from '@clerk/clerk-react'

function Page() {
  const { isSignedIn, getToken, signOut } = useAuth()
  const { user, isLoaded } = useUser()
  // ...
}
```

- 调用后端 API 时，若需要携带令牌：

```ts
const token = await getToken({ template: 'default' }) // 或自定义 template
await fetch('/api/xxx', {
  headers: { Authorization: `Bearer ${token}` },
})
```

> 这样一来，你就不需要自己管理 `accessToken` 的 cookie，也不需要自建的状态存储。

---

### 第 5 步：移除自建鉴权状态（可选但强烈建议）
项目中有 `src/stores/auth-store.ts`，用 cookie 保存 `accessToken` 并在全局持有 `user`。当完全交给 Clerk 时：

- 推荐删除或停用该 store，统一使用 Clerk 的 `useAuth`/`useUser`。
- 如果有地方依赖 `auth-store` 的 `user`/`accessToken`：
    - `user` 可用 `useUser().user` 替代；
    - `accessToken`/`JWT` 用 `useAuth().getToken()` 动态获取。

这能避免本地令牌过期、同步失配等问题，所有状态由 Clerk 统一管理。

---

### 第 6 步：现有受保护页面的简化示例
你现在的 `src/routes/clerk/_authenticated/user-management.tsx`：
- 已经在用 `useAuth()` 和 `<SignedIn>`；
- 但仍有手写的 `Unauthorized` 组件和重定向逻辑。

迁移到全局保护布局后，可以把页面精简为只关注业务 UI：

```tsx
// 迁移位置：src/routes/_authenticated/user-management.tsx
import { createFileRoute, Link } from '@tanstack/react-router'
import { UserButton } from '@clerk/clerk-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
// ... 其余业务组件

export const Route = createFileRoute('/_authenticated/user-management')({
  component: () => (
    <>
      <Header fixed>
        {/* ... */}
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <UserButton />
        </div>
      </Header>
      <Main>
        {/* 你的用户列表 UI */}
      </Main>
    </>
  ),
})
```

- 无需再在页面里判断 `isSignedIn` 或渲染 `Unauthorized`；未登录会被 `/_authenticated` 布局自动拦截并跳到 `SignIn`。

---

### 第 7 步：路由树建议
- 顶层：
    - `__root.tsx`：包含 `ClerkProvider` 和应用基础设施。
    - `/(auth)/sign-in.tsx`、`/(auth)/sign-up.tsx`：公共登录注册页。
    - `/_authenticated/route.tsx`：受保护布局（`SignedIn`/`SignedOut`）。
- 受保护页面全部放在 `/_authenticated/*` 下，例如：
    - `/_authenticated/dashboard.tsx`
    - `/_authenticated/user-management.tsx`
    - `/_authenticated/settings.tsx`
- 公开页面（如首页、帮助等）放在 `/_authenticated` 之外。

这样，鉴权逻辑只有一处，页面只关心业务 UI。

---

### 常见坑位与对策
- 忘记把 `ClerkProvider` 放到应用最顶层，导致部分页面未被 Clerk 上下文覆盖；
- `signInUrl`/`signUpUrl` 配置与实际路由不一致，导致重定向 404；
- 同时保留本地 `cookie`/`zustand` 鉴权状态与 Clerk 并存，产生冲突或双重来源；
- 请求后端时没用 `getToken()` 获取最新令牌，导致 401；
- SSR/边缘渲染场景下需要使用 Clerk 的服务器 SDK，这里你的项目是 Vite SPA 客户端渲染为主，上述客户端方案即可。

---

### 总结
- 把 `ClerkProvider` 提升到根路由；
- 用一个 `/_authenticated` 布局统一做鉴权：`SignedIn` 渲染内容，`SignedOut` 直接 `<RedirectToSignIn />`；
- 页面内部用 `useAuth`/`useUser` 获取状态，不再维护自建 `auth-store` 和 cookie；
- 登录/注册放在公共路由下，未登录访问受保护页面会被自动重定向到登录页。

这样一来，整个应用的用户鉴权就完全交由 Clerk 处理，且路由结构清晰、易维护。