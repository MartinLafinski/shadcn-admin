# 网站管理功能开发文档

## 概述

网站管理功能允许用户添加、编辑、删除和管理网站信息。该功能包括完整的CRUD操作（创建、读取、更新、删除），以及网站启用/禁用功能。

## 功能特性

- **创建网站**: 添加新的网站记录，包括名称、slug、URL和描述
- **查看网站列表**: 以表格形式展示所有网站，并支持搜索和分页
- **编辑网站**: 修改网站的基本信息
- **启用/禁用网站**: 通过切换按钮快速启用或禁用网站
- **网站详情**: 查看网站的详细信息

## 修改的文件列表

以下是我为实现网站管理功能而添加或修改的文件：

### 新增文件

1. `src/features/websites/api/websites.ts`
   - 创建了与网站API交互的服务函数
   - 定义了网站相关的数据类型
   - 实现了React Query的hooks用于数据获取和变更

2. `src/features/websites/components/websites-data-table.tsx`
   - 创建了可分页、可排序、可过滤的数据表格组件
   - 集成了TanStack Table库的功能

3. `src/features/websites/components/websites-columns.tsx`
   - 定义了表格的列结构
   - 包含自定义渲染逻辑（如开关组件、操作按钮）
   - 集成了网站状态切换功能

4. `src/features/websites/components/website-form.tsx`
   - 创建了网站创建/编辑的表单组件
   - 集成了React Hook Form和Zod验证
   - 支持创建和编辑两种模式

5. `src/features/websites/index.tsx`
   - 创建了网站管理的主页面组件
   - 集成了所有子组件和功能
   - 实现了页面状态管理和UI布局

6. `docs/3-websites.md`
   - 创建了网站管理功能的开发文档

### 修改文件

1. `src/routes/_authenticated/websites/index.tsx`
   - 更新路由组件以使用新的Websites组件
   - 将原来的占位符内容替换为实际的网站管理功能

## 技术架构

### 前端技术栈
- React + TypeScript
- TanStack React Query (数据获取和缓存)
- TanStack React Table (数据表格)
- Shadcn UI 组件库
- React Hook Form + Zod (表单验证)

### API 接口

#### 1. 获取网站列表
```
GET /websites/?page=1&size=50
```
- 参数: `page` (页码), `size` (每页大小)
- 返回: 网站对象数组

#### 2. 根据ID获取网站
```
GET /websites/{website_id}/
```
- 参数: `website_id` (网站ID)
- 返回: 单个网站对象

#### 3. 创建网站
```
POST /websites/
```
- 请求体: 包含网站信息的对象
- 验证: 名称2-32字符, slug符合正则`^[a-zA-Z0-9\-_]{2,64}$`

#### 4. 更新网站
```
PUT /websites/{website_id}
```
- 参数: `website_id` (网站ID)
- 请求体: 包含更新信息的对象

#### 5. 部分更新网站配置
```
PATCH /websites/{website_id}
```
- 参数: `website_id` (网站ID)
- 请求体: 部分更新对象

#### 6. 切换网站状态
```
POST /websites/{website_id}/switch/
```
- 参数: `website_id` (网站ID)
- 请求体: 包含启用状态的对象

#### 7. 同步网站
```
POST /websites/sync/
```

### 数据模型

```typescript
interface Website {
  website_id: string;
  created_at: string;
  updated_at: string;
  updated_by: string;
  website_enabled: boolean;
  website_name: string;
  website_slug: string;
  website_url?: string;
  website_config: Record<string, any>;
  website_readme: string;
}
```

## 组件结构

```
src/features/websites/
├── api/
│   └── websites.ts           # API 服务和 React Query Hooks
├── components/
│   ├── websites-data-table.tsx  # 数据表格组件
│   ├── websites-columns.tsx     # 表格列定义
│   └── website-form.tsx         # 创建/编辑表单组件
└── index.tsx                 # 主页面组件
```

### API 服务 (websites.ts)

包含以下功能:
- 用于与后端API交互的函数
- React Query hooks 用于数据获取和变更操作
- 定义了数据传输对象类型

### 数据表格组件 (websites-data-table.tsx)

- 使用TanStack Table实现的可分页、可排序、可过滤的数据表格
- 支持多选和行操作
- 响应式设计

### 表格列定义 (websites-columns.tsx)

- 定义表格的列结构
- 包含自定义渲染逻辑（如开关组件、操作按钮）
- 集成网站状态切换功能

### 表单组件 (website-form.tsx)

- 使用React Hook Form和Zod实现的表单验证
- 支持创建和编辑两种模式
- 包含字段验证和错误提示

### 主页面组件 (index.tsx)

- 整合所有子组件
- 处理页面状态管理
- 集成头部和布局组件

## 实现细节

### 状态管理

使用React的useState Hook管理以下状态:
- 表单弹窗打开/关闭
- 编辑的网站数据
- 加载状态

### 数据获取和缓存

使用TanStack Query进行数据获取和缓存:
- 自动数据缓存和失效
- 请求去重
- 错误处理和重试机制

### 表单验证

使用Zod进行表单验证:
- 网站名称: 2-32字符
- 网站slug: 2-32字符，只允许字母、数字、连字符和下划线
- 网站URL: 有效的URL格式
- 描述: 最多500字符

## 使用说明

### 运行环境

确保设置以下环境变量:
```
VITE_API_URL=http://127.0.0.1:8888
```

### 添加新网站

1. 点击"Add Website"按钮
2. 填写网站信息表单
3. 点击"Create Website"按钮

### 编辑网站

1. 在表格中找到要编辑的网站
2. 点击"Edit"按钮
3. 修改网站信息
4. 点击"Update Website"按钮

### 启用/禁用网站

使用表格中每行的开关组件直接切换网站的启用状态。

## 错误处理

- 网络错误: 显示错误提示并提供重试选项
- 表单验证错误: 在相应字段旁显示具体错误信息
- 服务器错误: 使用toast通知显示错误信息

## 扩展功能

### 未来可能的增强功能

- 网站分析和统计数据
- 批量操作功能
- 高级搜索和过滤
- 导出网站数据功能
- 网站配置的JSON编辑器

## 部署注意事项

- 确保后端API服务正常运行
- 配置正确的API基础URL
- 设置适当的CORS策略

## 后续修改说明

如果需要对网站管理功能进行进一步修改，可能需要编辑以下文件：

1. **API功能增强** - 修改 `src/features/websites/api/websites.ts`
   - 添加新的API端点
   - 修改数据类型定义
   - 更新React Query hooks

2. **UI/UX改进** - 修改 `src/features/websites/index.tsx` 或组件文件
   - 调整页面布局
   - 修改表格样式
   - 更新表单字段

3. **表单验证调整** - 修改 `src/features/websites/components/website-form.tsx`
   - 添加或修改验证规则
   - 调整字段类型或布局

4. **表格功能增强** - 修改 `src/features/websites/components/websites-columns.tsx`
   - 添加新的列
   - 修改列行为
   - 调整操作按钮

5. **路由或导航调整** - 修改 `src/routes/_authenticated/websites/index.tsx`
   - 调整路由配置
   - 修改页面权限控制
