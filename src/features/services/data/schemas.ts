import { z } from 'zod'

export const ClusterServiceSchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string(),
  port: z.number().int(),
  meta: z.record(z.string(), z.any()),
  status: z.string().optional(),
  node_id: z.string(),
  instance_name: z.string(),
  service_slug: z.string(),
})

export type ClusterServiceData = z.infer<typeof ClusterServiceSchema>
