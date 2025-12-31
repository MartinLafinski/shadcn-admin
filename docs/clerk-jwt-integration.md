# 获取 Clerk 鉴权信息和 JWT 令牌

## 概述
本文档说明如何在 Shadcn Admin Dashboard 项目中获取 Clerk 登录成功后的鉴权信息和 JWT 令牌。

## 1. 使用 Clerk React 钩子获取用户信息

### useUser 钩子
```javascript
import { useUser } from '@clerk/clerk-react'

function MyComponent() {
  const { user, isLoaded, isSignedIn } = useUser()

  if (!isLoaded) return null
  if (!isSignedIn) return <div>请登录</div>

  return (
    <div>
      <p>用户名: {user.username}</p>
      <p>邮箱: {user.primaryEmailAddress?.emailAddress}</p>
      <p>全名: {user.fullName}</p>
    </div>
  )
}
```

### useAuth 钩子
```javascript
import { useAuth } from '@clerk/clerk-react'

function MyComponent() {
  const { isSignedIn, userId, sessionId, actor } = useAuth()

  if (isSignedIn) {
    console.log('用户ID:', userId)
    console.log('会话ID:', sessionId)
  }

  return <div>认证状态: {isSignedIn ? '已登录' : '未登录'}</div>
}
```

## 2. 获取 JWT 令牌

### 使用 getToken 方法
```javascript
import { useAuth } from '@clerk/clerk-react'

function MyComponent() {
  const { getToken } = useAuth()

  const handleGetToken = async () => {
    // 获取访问令牌
    const token = await getToken()
    console.log('JWT 令牌:', token)

    // 获取具有特定权限的令牌
    const tokenWithPermission = await getToken({ 
      template: 'token-template-name' // 可选：使用特定模板
    })
  }

  return <button onClick={handleGetToken}>获取 JWT 令牌</button>
}
```

## 3. 在 API 调用中使用 JWT 令牌

### 与 Axios 集成
```javascript
import { useAuth } from '@clerk/clerk-react'
import axios from 'axios'

function MyComponent() {
  const { getToken } = useAuth()

  const makeAuthenticatedRequest = async () => {
    const token = await getToken()

    const response = await axios.get('/api/protected-endpoint', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return response.data
  }

  return <button onClick={makeAuthenticatedRequest}>获取受保护数据</button>
}
```

## 4. 在 TanStack Query 中使用认证令牌

```javascript
import { useAuth } from '@clerk/clerk-react'
import { useQuery } from '@tanstack/react-query'

function MyComponent() {
  const { getToken } = useAuth()

  const { data, isLoading, error } = useQuery({
    queryKey: ['protected-data'],
    queryFn: async () => {
      const token = await getToken()
      const response = await fetch('/api/protected-endpoint', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response.json()
    },
  })

  if (isLoading) return <div>加载中...</div>
  if (error) return <div>错误: {error.message}</div>

  return <div>{JSON.stringify(data)}</div>
}
```

## 5. 认证状态管理

### 使用项目中的 auth-store
项目中已经实现了 auth-store.ts 用于管理认证状态：

```javascript
import { useAuthStore } from '@/stores/auth-store'

// 在组件中使用
function MyComponent() {
  const { auth } = useAuthStore()

  // 检查认证状态
  const isAuthenticated = auth.isAuthenticated

  return <div>认证状态: {isAuthenticated ? '已认证' : '未认证'}</div>
}
```

## 6. 鉴权守卫和路由保护

### 保护路由示例
```javascript
import { useAuth } from '@clerk/clerk-react'
import { Navigate } from '@tanstack/react-router'

function ProtectedComponent() {
  const { isSignedIn, isLoaded } = useAuth()

  if (!isLoaded) {
    return <div>加载中...</div>
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" />
  }

  return <div>受保护的内容</div>
}
```

## 7. 服务器端获取认证信息

### 在 API 路由中验证 JWT
```javascript
import { auth } from '@clerk/nextjs/server'

export async function GET(request) {
  const { userId } = auth()
  
  if (!userId) {
    return new Response('未认证', { status: 401 })
  }

  // 使用 userId 进行进一步处理
  return new Response(`用户 ${userId} 已认证`)
}
```

## 8. 常见用例

### 存储用户信息到本地状态
```javascript
import { useAuth, useUser } from '@clerk/clerk-react'
import { useState, useEffect } from 'react'

function UserProfile() {
  const { getToken } = useAuth()
  const { user } = useUser()
  const [jwtToken, setJwtToken] = useState(null)

  useEffect(() => {
    const fetchToken = async () => {
      const token = await getToken()
      setJwtToken(token)
      
      // 现在可以将令牌存储到应用状态或用于 API 调用
      console.log('JWT 令牌已获取:', token)
    }

    if (user) {
      fetchToken()
    }
  }, [user, getToken])

  return (
    <div>
      <p>用户: {user?.firstName} {user?.lastName}</p>
      <p>JWT 令牌已获取: {!!jwtToken}</p>
    </div>
  )
}
```

## 9. 错误处理

### 处理令牌获取失败
```javascript
import { useAuth } from '@clerk/clerk-react'

function TokenComponent() {
  const { getToken, isSignedIn } = useAuth()

  const handleGetToken = async () => {
    try {
      if (!isSignedIn) {
        throw new Error('用户未登录')
      }
      
      const token = await getToken()
      console.log('成功获取令牌:', token)
      
      // 使用令牌进行 API 调用
      return token
    } catch (error) {
      console.error('获取令牌失败:', error)
      // 处理错误，可能需要重定向到登录页面
    }
  }

  return (
    <button onClick={handleGetToken} disabled={!isSignedIn}>
      {isSignedIn ? '获取令牌' : '请先登录'}
    </button>
  )
}
```

## 10. 项目中已有的实现

在 Shadcn Admin Dashboard 项目中，认证信息的处理已经在以下文件中实现：

- `src/stores/auth-store.ts` - 全局认证状态管理
- `src/main.tsx` - 在 React Query 的错误处理中使用认证信息
- `src/lib/handle-server-error.ts` - 服务器错误处理

这些文件展示了如何在实际应用中获取和使用 Clerk 的认证信息。