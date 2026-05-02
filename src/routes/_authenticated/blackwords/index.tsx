import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Blackwords } from '@/features/blackwords'

/**
 * 敏感词管理页面路由配置
 *
 * 该路由对应路径为 /_authenticated/blackwords/，用于展示和管理用户的所有敏感词
 * 使用 TanStack Router 的路由定义方式创建页面路由
 *
 * 路由结构：
 * - 路径: /_authenticated/blackwords/
 * - 组件: RouteComponent (渲染 Blackwords 组件)
 * - 认证: 需要在认证布局下使用 (_authenticated 前缀)
 */
export const Route = createFileRoute('/_authenticated/blackwords/')({
  component: RouteComponent,
  validateSearch: (search) => {
    return z
      .object({
        blackwords_keyword: z.string().optional(),
        blackwords_enabled: z.boolean().optional(),
        page: z.number().optional(),
        size: z.number().optional(),
      })
      .parse(search)
  },
})

/**
 * 路由组件 - 敏感词管理页面
 *
 * 这是敏感词管理页面的入口组件，主要负责渲染 Blackwords 功能组件
 * Blackwords 组件包含了敏感词列表、创建、编辑等完整功能
 *
 * 开发指引：
 * 1. 如需在页面加载前执行额外逻辑，可在 Route 定义中添加 beforeLoad 钩子
 * 2. 如需在页面渲染前进行权限检查，可在 Route 定义中添加 loader 函数
 * 3. 如需向子组件传递额外属性，可在 RouteComponent 中添加 props 传递
 */
function RouteComponent() {
  return <Blackwords />
}
