import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { SpiderPackages } from '@/features/spider-packages'

export const Route = createFileRoute('/_authenticated/spider-packages/')({
  component: RouteComponent,
  validateSearch: (search) => {
    return z
      .object({
        spider_package_keyword: z.string().optional(),
        spider_package_enabled: z.boolean().optional(),
        page: z.number().optional(),
        size: z.number().optional(),
      })
      .parse(search)
  },
})

function RouteComponent() {
  return <SpiderPackages />
}
