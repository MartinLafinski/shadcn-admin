import { z } from 'zod'

export const WebsiteItemSchema = z.object({
    website_id: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
    updated_by: z.string(),
    website_enabled: z.boolean(),
    website_name: z.string(),
    website_slug: z.string(),
    website_url: z.string().optional(),
})

export const WebsiteSchema = WebsiteItemSchema.extend({
    website_config: z.record(z.string(), z.any()),
    website_readme: z.string(),
})

export type WebsiteItem = z.infer<typeof WebsiteItemSchema>
export type Website = z.infer<typeof WebsiteSchema>
