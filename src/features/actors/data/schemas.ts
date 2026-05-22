import { z } from 'zod'

export const ClusterActorSchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string(),
  port: z.number().int(),
  meta: z.record(z.string(), z.any()),
  status: z.string().optional(),
  actor_uid: z.string(),
  actor_type: z.string(),
  node_id: z.string(),
  pid: z.number().int(),
  start_timestamp: z.number(),
})

export type ClusterActorData = z.infer<typeof ClusterActorSchema>
