import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCreateWebsiteMutation, useUpdateWebsiteMutation, Website } from '@/features/websites/api/websites';
import { toast } from 'sonner';

const websiteFormSchema = z.object({
  website_name: z
    .string()
    .min(2, {
      message: 'Website name must be at least 2 characters.',
    })
    .max(32, {
      message: 'Website name must not exceed 32 characters.',
    }),
  website_slug: z
    .string()
    .min(2, {
      message: 'Website slug must be at least 2 characters.',
    })
    .max(32, {
      message: 'Website slug must not exceed 32 characters.',
    })
    .regex(/^[a-zA-Z0-9\-_]{2,64}$/, {
      message: 'Website slug can only contain letters, numbers, hyphens, and underscores.',
    }),
  website_url: z
    .string()
    .url({
      message: 'Website URL must be a valid URL.',
    })
    .optional()
    .or(z.literal('')),
  website_readme: z
    .string()
    .max(500, {
      message: 'Description must not exceed 500 characters.',
    })
    .optional(),
  website_enabled: z.boolean().optional().default(true),
});

type WebsiteFormValues = z.infer<typeof websiteFormSchema>;

interface WebsiteFormProps {
  website?: Website;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function WebsiteForm({ website, open, onOpenChange, onSuccess }: WebsiteFormProps) {
  const isEditing = !!website;
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const createMutation = useCreateWebsiteMutation();
  const updateMutation = useUpdateWebsiteMutation();

  const form = useForm<WebsiteFormValues>({
    resolver: zodResolver(websiteFormSchema),
    defaultValues: {
      website_name: website?.website_name || '',
      website_slug: website?.website_slug || '',
      website_url: website?.website_url || '',
      website_readme: website?.website_readme || '',
      website_enabled: website?.website_enabled || true,
    },
  });

  async function onSubmit(data: WebsiteFormValues) {
    setIsSubmitting(true);
    
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({
          websiteId: website!.website_id,
          data: {
            website_name: data.website_name,
            website_slug: data.website_slug,
            website_url: data.website_url || undefined,
            website_readme: data.website_readme || undefined,
            website_config: website?.website_config || {},
          }
        });
        toast.success('Website updated successfully!');
      } else {
        await createMutation.mutateAsync({
          website_name: data.website_name,
          website_slug: data.website_slug,
          website_url: data.website_url || undefined,
          website_readme: data.website_readme || undefined,
          website_config: {},
        });
        toast.success('Website created successfully!');
      }
      
      if (onSuccess) {
        onSuccess();
      }
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error(isEditing ? 'Update' : 'Create', 'website error:', error);
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} website`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Website' : 'Create New Website'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update the information for this website.' 
              : 'Fill in the details to create a new website.'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="website_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter website name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="website_slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website Slug *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter website slug" {...field} />
                    </FormControl>
                    <FormDescription>
                      Used in URLs and internal references. No spaces allowed.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="website_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com" {...field} />
                  </FormControl>
                  <FormDescription>
                    The public URL of the website (optional).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="website_readme"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe this website..."
                      className="resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Additional information about this website.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="website_enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Enable Website</FormLabel>
                    <FormDescription>
                      Whether this website is active and accessible.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting 
                  ? (isEditing ? 'Updating...' : 'Creating...') 
                  : (isEditing ? 'Update Website' : 'Create Website')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
