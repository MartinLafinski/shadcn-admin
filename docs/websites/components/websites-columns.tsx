import { ColumnDef } from '@tanstack/react-table';
import { Website } from '@/features/websites/data/schemas';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { useSwitchWebsiteMutation } from '@/features/websites/api/websites';
import {Badge} from "@/components/ui/badge.tsx";
import * as React from "react";
import {SmartDatetime} from "@/components/smart/datetime.tsx";

export const websitesColumns: ColumnDef<Website>[] = [
  {
    accessorKey: 'website_id',
    header: '网站ID',
    cell: ({ row }) => (
        <div className="text-center">{row.getValue('website_id')}</div>
    ),
  },
  {
    accessorKey: 'website_name',
    header: '网站名称',
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue('website_name')}</div>
    ),
  },
  {
    accessorKey: 'website_slug',
    header: '网站标识',
    cell: ({ row }) => <div>{row.getValue('website_slug')}</div>,
  },
  {
    accessorKey: 'website_url',
    header: 'URL',
    cell: ({ row }) => {
      const url = row.getValue('website_url') as string;
      return url ? (
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          {url}
        </a>
      ) : (
        <span className="text-gray-400">-</span>
      );
    },
  },
  {
    accessorKey: 'website_enabled',
    header: '可用',
    cell: ({ row }) => {
      const website = row.original;
      const switchMutation = useSwitchWebsiteMutation();

      const handleToggle = async (enabled: boolean) => {
        try {
          await switchMutation.mutateAsync({
            websiteId: website.website_id,
            data: { enabled },
          });
        } catch (error) {
          console.error('Failed to update website status:', error);
        }
      };

      return (
        <Switch
          checked={row.getValue('website_enabled')}
          onCheckedChange={handleToggle}
        />
      );
    },
  },
  {
    accessorKey: 'created_at',
    header: '创建时间',
    cell: ({ row }) => {
      const createdAt = row.getValue('created_at') as string;
      return createdAt ? (
          <SmartDatetime date={createdAt} timezone="Asia/Shanghai" />
      ) : (
          <span className="text-gray-400">-</span>
      );
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const website = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(website.website_id)}
            >
              Copy ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>View Details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];