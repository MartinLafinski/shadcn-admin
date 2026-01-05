# Shadcn Admin Dashboard 项目上下文

## 项目概述

Shadcn Admin Dashboard 是一个使用 Shadcn UI 和 Vite 构建的现代化管理面板 UI。该项目专注于响应性和可访问性，提供了一个功能丰富的管理界面模板，包含多个页面和自定义组件。项目版本为 2.2.1，使用 React 19 和 TypeScript 构建。

### 主要特性
- 支持浅色/深色模式
- 响应式设计
- 无障碍访问
- 内置侧边栏组件
- 全局搜索命令
- 10+ 个页面
- 额外的自定义组件
- RTL（从右到左）语言支持
- TanStack Router 路由系统
- 基于 Clerk 的认证系统
- 数据表格和 CRUD 操作功能
- 智能日期时间组件
- 分页配置管理
- 网站管理功能
- 黑词管理功能
- 链接管理功能
- 模板管理功能
- 应用管理功能
- 用户管理功能
- 任务管理功能
- 聊天功能

### 项目结构
```
shadcn-admin/
├── public/                 # 静态资源
│   └── images/             # 图片资源
├── src/                    # 源代码目录
│   ├── assets/            # 静态资源（图标、图片等）
│   ├── components/        # UI 组件
│   │   ├── data-table/    # 数据表格组件
│   │   ├── layout/        # 布局组件
│   │   ├── smart/         # 智能组件
│   │   └── ui/            # 基础 UI 组件
│   ├── config/            # 配置文件
│   ├── context/           # React Context
│   ├── features/          # 功能模块
│   ├── hooks/             # 自定义 React Hooks
│   ├── lib/               # 工具函数
│   ├── routes/            # 路由定义
│   ├── stores/            # 状态管理 (zustand)
│   ├── styles/            # 样式文件
│   └── main.tsx           # 应用入口
├── docs/                  # 文档
├── .env.example           # 环境变量示例
├── package.json           # 项目依赖和脚本
├── tsconfig.json          # TypeScript 配置
├── vite.config.ts         # Vite 构建配置
└── README.md              # 项目说明
```

## 技术栈

**UI框架:** [ShadcnUI](https://ui.shadcn.com) (TailwindCSS + RadixUI)
**构建工具:** [Vite](https://vitejs.dev/)
**路由:** [TanStack Router](https://tanstack.com/router/latest)
**类型检查:** [TypeScript](https://www.typescriptlang.org/)
**代码检查/格式化:** [ESLint](https://eslint.org/) & [Prettier](https://prettier.io/)
**图标:** [Lucide Icons](https://lucide.dev/icons/)
**认证:** [Clerk](https://go.clerk.com/GttUAaK)
**状态管理:** [Zustand](https://zustand-demo.pmnd.rs/)
**数据获取:** [TanStack Query](https://tanstack.com/query/latest)
**表单处理:** [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
**日期处理:** [date-fns](https://date-fns.org/)
**图表库:** [Recharts](https://recharts.org/)

## 构建和运行

### 安装依赖
```bash
pnpm install
```

### 开发环境运行
```bash
pnpm run dev
```

### 构建项目
```bash
pnpm run build
```

### 其他命令
- 代码检查: `pnpm run lint`
- 格式化代码: `pnpm run format`
- 预览构建产物: `pnpm run preview`
- 检查代码格式: `pnpm run format:check`
- 检查未使用的代码: `pnpm run knip`

## 开发约定

### 路由结构
- 使用 TanStack Router 进行路由管理
- 路由文件按照约定在 `src/routes/` 目录中自动生成
- 支持嵌套路由和懒加载
- 使用文件系统路由约定
- 支持路由参数和嵌套路由结构
- 新增路由会自动在 `routeTree.gen.ts` 中生成
- 认证相关路由位于 `src/routes/_authenticated/` 目录下

### 组件结构
- 使用 Shadcn UI 组件作为基础
- 部分组件经过自定义以支持 RTL 语言
- 组件分为 UI 组件、布局组件、数据表格组件和智能组件
- 自定义组件包括 data-table、layout、smart 等组件类型
- 智能组件（如 datetime.tsx）提供增强功能
- 数据表格组件支持分页、搜索、筛选、批量操作等功能

### 状态管理
- 使用 Zustand 进行全局状态管理
- 使用 React Context 进行主题、方向、字体管理
- 使用 TanStack Query (React Query) 进行服务器状态管理
- 实现错误处理和缓存策略

### 主题系统
- 支持浅色/深色模式切换
- 可选择跟随系统设置
- 使用 cookie 保存用户选择的主题
- 支持多种字体选择（inter、manrope、system）

### 认证系统
- 集成 Clerk 进行用户认证
- 支持登录/注册流程
- 包含会话管理和权限控制
- 实现 401、403 等认证相关的错误处理

## 重要文件和目录

### `src/features/`
包含主要功能模块:
- `apps/` - 应用管理
- `auth/` - 认证模块
- `blackwords/` - 黑词管理 (新增功能)
- `chats/` - 聊天功能
- `dashboard/` - 仪表板
- `errors/` - 错误页面
- `links/` - 链接管理 (新增功能)
- `settings/` - 设置页面 (包含账户、外观、显示、通知子页面)
- `tasks/` - 任务管理
- `templates/` - 模板管理 (新增功能)
- `users/` - 用户管理
- `websites/` - 网站管理 (新增功能)

### `src/components/`
包含通用 UI 组件，分为:
- `ui/` - Shadcn UI 基础组件
- `layout/` - 布局组件 (包含侧边栏、头部等)
- `data-table/` - 数据表格组件 (包含工具栏、分页、批量操作等)
- `smart/` - 智能组件 (如 datetime 组件)
- 其他自定义组件 (命令菜单、配置抽屉等)

### `src/context/`
React Context 提供:
- `theme-provider.tsx` - 主题管理
- `direction-provider.tsx` - 文本方向管理
- `font-provider.tsx` - 字体管理
- `search-provider.tsx` - 搜索功能管理
- `layout-provider.tsx` - 布局管理

### `src/stores/`
Zustand 状态管理:
- `auth-store.ts` - 用户认证状态

### `src/config/`
- `fonts.ts` - 字体配置
- `pagination.ts` - 分页配置

### `src/hooks/`
- `use-dialog-state.tsx` - 对话框状态管理
- `use-mobile.tsx` - 移动端检测
- `use-table-url-state.ts` - 表格 URL 状态管理

### `src/lib/`
- `cookies.ts` - Cookie 操作工具
- `handle-server-error.ts` - 服务器错误处理
- `show-submitted-data.tsx` - 数据显示工具
- `utils.ts` - 通用工具函数

## 环境变量

项目使用 Clerk 进行认证，需要以下环境变量:
- `VITE_CLERK_PUBLISHABLE_KEY` - Clerk 发布密钥
- `VITE_API_URL` - (可选) API 基础 URL，默认为 `http://127.0.0.1:8888`

## 新增功能和文档

### 网站管理功能
- 在 `src/features/websites` 目录下新增了网站管理功能
- 包含完整的 CRUD 操作 API 调用
- 包含组件和数据模式定义 (使用 Zod 验证)
- 在路由中添加了 `/websites` 路径
- 实现了分页、搜索、筛选等功能
- 提供批量操作（切换状态、删除、导出等）

### 黑词管理功能
- 在 `src/features/blackwords` 目录下新增了黑词管理功能
- 包含完整的 CRUD 操作 API 调用
- 包含组件和数据模式定义 (使用 Zod 验证)
- 在路由中添加了 `/blackwords` 路径
- 提供批量操作（删除、导出等）
- 包含对话框和抽屉组件用于创建、更新和配置

### 链接管理功能
- 在 `src/features/links` 目录下新增了链接管理功能
- 包含完整的 CRUD 操作 API 调用
- 包含组件和数据模式定义 (使用 Zod 验证)
- 在路由中添加了 `/links` 路径
- 实现了分页、搜索、筛选等功能

### 模板管理功能
- 在 `src/features/templates` 目录下新增了模板管理功能
- 包含完整的 CRUD 操作 API 调用
- 包含组件和数据模式定义 (使用 Zod 验证)
- 在路由中添加了 `/templates` 路径
- 提供批量操作（删除、导出等）

### 智能组件
- 在 `src/components/smart/` 目录下新增了 `datetime.tsx` 组件
- 提供智能日期时间显示，支持时区转换和格式化
- 集成国际化日期格式处理

### 分页配置
- 在 `src/config/pagination.ts` 中新增了分页配置
- 包含分页信息的 Zod 验证模式
- 提供了从响应头提取分页信息的工具函数

### 文档文件
- `docs/1-clerk.md` - Clerk 集成文档
- `docs/2-fastapi-clerk.md` - FastAPI 与 Clerk 集成文档
- `docs/3-websites.md` - 网站功能文档
- `docs/4-menus.md` - 菜单功能文档
- `docs/websites/` - 网站功能详细文档
- `docs/clerk-jwt-integration.md` - Clerk JWT 集成文档

## 项目约定

1. **代码风格**: 使用 ESLint 和 Prettier 保持代码一致性
2. **类型安全**: 使用 TypeScript 进行类型检查，使用 Zod 进行运行时验证
3. **组件命名**: 采用帕斯卡命名法 (PascalCase)
4. **文件结构**: 按功能模块组织代码
5. **路由约定**: 采用文件系统路由
6. **无障碍访问**: 遵循 WAI-ARIA 标准
7. **响应式设计**: 使用 Tailwind CSS 实现响应式布局
8. **国际化**: 支持 RTL (从右到左) 语言
9. **错误处理**: 实现全局错误处理和用户友好的错误提示
10. **数据获取**: 使用 TanStack Query 进行数据获取和缓存管理
11. **API 交互**: 使用 Fetch API 进行 HTTP 请求，包含错误处理和重试逻辑
12. **状态管理**: 使用 TanStack Query 进行服务器状态管理，Zustand 进行本地状态管理

## 构建配置

- 使用 Vite 作为构建工具，支持快速开发和热模块替换
- 集成 TanStack Router 插件进行自动路由生成
- 集成 Tailwind CSS Vite 插件
- 使用 TypeScript 编译器 (TSC) 进行类型检查
- 配置路径别名 (`@/*` 指向 `./src/*`)
- 支持代码分割和懒加载
- 使用 SWC 进行更快的编译

## API 集成

- 使用 Fetch API 进行 HTTP 请求
- 集成 Clerk 认证
- 支持 JWT token 获取和使用
- 包含完整的错误处理机制
- 实现了数据验证和类型安全

## 数据管理

- 使用 Zod 进行数据验证
- 实现了完整的 CRUD 操作模式
- 支持分页、搜索和过滤
- 包含数据缓存和失效策略
- 实现了批量操作支持