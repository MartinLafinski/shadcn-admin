# Shadcn Admin Dashboard

## 项目概述

这是一个基于 React + TypeScript + Vite 构建的现代化管理后台模板，采用 Shadcn UI 组件库和 Tailwind CSS 进行样式设计。

### 主要技术栈

- **UI 框架**: [Shadcn UI](https://ui.shadcn.com) (基于 Tailwind CSS + Radix UI)
- **构建工具**: [Vite](https://vitejs.dev/)
- **路由**: [TanStack Router](https://tanstack.com/router/latest) (文件系统路由)
- **状态管理**: [Zustand](https://github.com/pmndrs/zustand)
- **数据获取**: [TanStack Query (React Query)](https://tanstack.com/query/latest)
- **表单处理**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **认证**: [Clerk](https://clerk.com/)
- **图表**: [Recharts](https://recharts.org/)
- **动画**: [Framer Motion](https://www.framer.com/motion/)
- **图标**: [Lucide React](https://lucide.dev/)

## 项目结构

```
src/
├── assets/           # 静态资源
├── components/       # 组件
│   ├── data-table/   # 数据表格组件
│   ├── layout/       # 布局组件 (侧边栏、导航等)
│   ├── smart/        # 智能组件
│   └── ui/           # Shadcn UI 组件
├── config/           # 配置文件
├── context/          # React Context Providers
│   ├── direction-provider.tsx   # RTL/LTR 方向支持
│   ├── font-provider.tsx        # 字体管理
│   ├── layout-provider.tsx      # 布局状态
│   ├── search-provider.tsx      # 全局搜索
│   └── theme-provider.tsx       # 主题管理
├── features/         # 功能模块 (按业务领域组织)
│   ├── apps/
│   ├── auth/
│   ├── blackwords/
│   ├── chats/
│   ├── clusters/
│   ├── dashboard/
│   ├── entrypoints/
│   ├── errors/
│   ├── industries/
│   ├── jobs/
│   ├── links/
│   ├── pre-tasks/
│   ├── prejobs/
│   ├── reqs/
│   ├── settings/
│   ├── tasks/
│   ├── templates/
│   ├── users/
│   └── websites/
├── hooks/            # 自定义 React Hooks
├── lib/              # 工具函数和库
│   └── utils.ts      # 通用工具函数 (cn, sleep, getPageNumbers)
├── routes/           # 路由定义 (TanStack Router)
│   ├── __root.tsx    # 根路由布局
│   ├── (auth)/       # 认证相关路由
│   ├── (errors)/     # 错误页面路由
│   └── _authenticated/  # 需要认证的路由
├── stores/           # Zustand 状态存储
│   └── auth-store.ts # 认证状态
└── styles/           # 样式文件
    ├── index.css     # 主样式入口
    └── theme.css     # 主题变量
```

## 开发命令

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm run dev

# 构建生产版本
pnpm run build

# 预览生产构建
pnpm run preview

# 代码检查
pnpm run lint

# 格式化代码
pnpm run format

# 检查未使用的依赖
pnpm run knip
```

## 开发约定

### 代码风格

- **TypeScript**: 严格模式，使用类型导入 (`import type`)
- **ESLint**: 配置在 `eslint.config.js`
  - 禁止 `console` (生产环境)
  - 强制类型导入
  - 禁止重复导入
  - 未使用变量需要以 `_` 开头
- **Prettier**: 配置在 `.prettierrc`，使用 `@trivago/prettier-plugin-sort-imports` 排序导入

### 组件规范

- 使用 `cn()` 工具函数合并 Tailwind 类名
- Shadcn UI 组件位于 `src/components/ui/`
- 自定义组件位于 `src/components/`
- 组件使用函数声明而非箭头函数

### 路由约定

- 使用 TanStack Router 的文件系统路由
- 认证路由放在 `_authenticated/` 目录下
- 路由组件使用 `createFileRoute` 定义
- 路由树自动生成在 `src/routeTree.gen.ts`

### 状态管理

- 全局状态使用 Zustand，存储在 `src/stores/`
- 服务器状态使用 TanStack Query
- 认证状态存储在 cookie 中

### 样式约定

- 使用 Tailwind CSS v4
- 主题变量定义在 `src/styles/theme.css`
- 支持亮色/暗色/系统主题
- 支持 RTL (从右到左) 布局

## 关键配置

### 环境变量

```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...  # Clerk 认证密钥
```

### 路径别名

- `@/` 映射到 `src/`

### 自定义组件 (已修改)

以下组件经过自定义修改以支持 RTL:

- **修改组件**: scroll-area, sonner, separator
- **RTL 更新组件**: alert-dialog, calendar, command, dialog, dropdown-menu, select, table, sheet, sidebar, switch

## 功能特性

- ✅ 亮色/暗色模式切换
- ✅ 响应式设计
- ✅ 无障碍支持 (ARIA)
- ✅ 内置侧边栏组件
- ✅ 全局搜索命令面板
- ✅ 10+ 预置页面
- ✅ 自定义组件扩展
- ✅ RTL 语言支持
- ✅ 基于文件系统的路由
- ✅ 类型安全

## 认证流程

项目使用 Clerk 进行认证:

1. 根路由 (`__root.tsx`) 配置 ClerkProvider
2. `_authenticated` 路由组使用 `SignedIn`/`SignedOut` 组件控制访问
3. 未认证用户自动重定向到登录页
4. 认证状态通过 Zustand 存储管理

## 数据获取

- 使用 TanStack Query 进行服务器状态管理
- 默认配置:
  - 开发环境不重试
  - 生产环境最多重试 3 次
  - 401/403 错误不重试
  - 窗口聚焦时自动刷新 (仅生产环境)
  - 数据新鲜时间: 10 秒
