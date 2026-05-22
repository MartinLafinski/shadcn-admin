import { z } from 'zod'

export const ClusterServerSchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string(),
  port: z.number().int(),
  meta: z.record(z.string(), z.any()),
  status: z.string().optional(),
  node_id: z.string(),
  instance_name: z.string(),
  node_type: z.string(),
})

export type ClusterServerData = z.infer<typeof ClusterServerSchema>
