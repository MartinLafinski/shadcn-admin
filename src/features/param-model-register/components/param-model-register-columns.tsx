import { type ColumnDef } from '@tanstack/react-table'
import { CategoryMiniItemCell } from '@/components/smart/cells/category-mini-item-cell'
import { DatetimeCell } from '@/components/smart/cells/datetime-cell'
import { EntityIdCell } from '@/components/smart/cells/entity-id-cell'
import { EntitySelectCell } from '@/components/smart/cells/entity-select-cell'
import { EntitySelectHeader } from '@/components/smart/cells/entity-select-header'
import { EntrypointMiniItemCell } from '@/components/smart/cells/entrypoint-mini-item-cell'
import { IndustryMiniItemCell } from '@/components/smart/cells/industry-mini-item-cell'
import { ParamFormMiniItemCell } from '@/components/smart/cells/param-form-mini-item-cell'
import { ParamModelRegisterMiniItemCell } from '@/components/smart/cells/param-model-register-mini-item-cell'
import { PrejobMiniItemCell } from '@/components/smart/cells/prejob-mini-item-cell'
import { ShardStrategyCell } from '@/components/smart/cells/shard-strategy-cell'
import { SpiderPackageMiniItemCell } from '@/components/smart/cells/spider-package-mini-item-cell'
import { WebsiteMiniItemCell } from '@/components/smart/cells/website-mini-item-cell'
import type { EntrypointItemData } from '@/features/entrypoints/data/schemas'
import type { IndustryItemData } from '@/features/industries/data/schemas'
import { type ParamModelRegisterData } from '@/features/param-model-register/data/schemas'
import type { WebsiteData } from '@/features/websites/data/schemas'
import { ParamModelRegisterRowActions } from './actions/param-model-register-row-actions'
import { ParamModelRegisterEnabledSwitch } from './cells/param-model-register-enabled-switch'
import { useParamModelRegistersActions } from './param-model-register-provider'

export const paramModelRegisterColumns: ColumnDef<ParamModelRegisterData>[] = [
  {
    id: 'select',
    header: ({ table }) => <EntitySelectHeader table={table} />,
    cell: ({ row }) => <EntitySelectCell row={row} />,
    enableSorting: false,
    enableHiding: false,
    size: 40,
  },
  {
    id: 'register_id',
    accessorKey: 'register_id',
    header: 'ID',
    cell: ({ row }) => <EntityIdCell value={row.getValue('register_id')} />,
    enableHiding: false,
    size: 60,
  },
  {
    id: 'register_name',
    accessorKey: 'register_name',
    header: '名称',
    cell: ({ row }) => {
      const { setOpen, setCurrentRow } = useParamModelRegistersActions()
      return (
        <ParamModelRegisterMiniItemCell
          entity={
            row.original as {
              register_name: string | null | undefined
              register_slug: string
            }
          }
          onClick={() => {
            setCurrentRow(row.original)
            setOpen('view')
          }}
        />
      )
    },
    enableHiding: false,
    size: 180,
  },
  {
    id: 'spider_package',
    accessorKey: 'spider_package',
    header: '爬虫包',
    cell: ({ row }) => {
      const sp = row.original.spider_package
      if (sp) {
        return <SpiderPackageMiniItemCell entity={sp} asButton={true} />
      }
      return (
        <span className='font-mono text-sm'>
          {row.getValue('spider_slug') as string}
        </span>
      )
    },
    size: 120,
  },
  {
    id: 'category_type',
    accessorKey: 'category_type',
    header: '类别',
    cell: ({ row }) => {
      // const cat = row.original.category as Record<string, unknown> | null | undefined
      // if (cat) {
      //   const name = (cat.industry_name ?? cat.website_name ?? cat.entrypoint_name ?? cat.prejob_name) as string
      //   const slug = (cat.industry_slug ?? cat.website_slug ?? cat.entrypoint_slug ?? cat.prejob_slug) as string
      //   if (name) {
      //     return (
      //       <div className='flex flex-col'>
      //         <span className='text-sm font-semibold'>{name}</span>
      //         <code className='text-xs text-muted-foreground'>[{slug}]</code>
      //       </div>
      //     )
      //   }
      // }
      return (
        <CategoryMiniItemCell
          categoryType={row.getValue('category_type') as string}
        />
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    size: 180,
  },
  {
    id: 'category_entity',
    accessorKey: 'category',
    header: '类别实体',
    cell: ({ row }) => {
      const cat = row.original.category as
        | Record<string, unknown>
        | null
        | undefined
      if (!cat) return <span className='text-muted-foreground'>-</span>
      switch (row.original.category_type) {
        case 'industry':
          return (
            <IndustryMiniItemCell
              entity={cat as unknown as IndustryItemData}
              asButton={true}
            />
          )
        case 'website':
          return (
            <WebsiteMiniItemCell
              website={cat as unknown as WebsiteData}
              asLink={true}
            />
          )
        case 'entrypoint':
          return (
            <EntrypointMiniItemCell
              entrypoint={cat as unknown as EntrypointItemData}
              asLink={true}
            />
          )
        case 'prejob':
          return (
            <PrejobMiniItemCell
              entity={
                cat as unknown as { prejob_name: string; prejob_slug: string }
              }
              asButton={true}
            />
          )
        default:
          return <span className='text-muted-foreground'>-</span>
      }
    },
    size: 200,
  },
  {
    id: 'param_form',
    accessorKey: 'param_form',
    header: '参数要素包',
    cell: ({ row }) => {
      const pf = row.original.param_form
      if (pf) return <ParamFormMiniItemCell entity={pf} asLink={true} />
      return (
        <span className='font-mono text-sm'>
          {row.original.param_form_slug}
        </span>
      )
    },
    size: 180,
  },
  // {
  //   id: 'spider_package',
  //   accessorKey: 'spider_package',
  //   header: '爬虫包',
  //   cell: ({ row }) => {
  //     const sp = row.original.spider_package
  //     if (!sp) return <span className='text-muted-foreground'>-</span>
  //     return (
  //       <div className='flex flex-col'>
  //         <span className='text-sm font-medium'>{sp.spider_package_name}</span>
  //         <code className='text-xs text-muted-foreground'>
  //           [{sp.spider_package_slug}]
  //         </code>
  //       </div>
  //     )
  //   },
  //   size: 180,
  // },
  {
    id: 'shard_strategy',
    accessorKey: 'shard_strategy',
    header: '分片策略',
    cell: ({ row }) => (
      <ShardStrategyCell
        strategy={row.getValue('shard_strategy') as string | null}
      />
    ),
    size: 100,
  },
  {
    id: 'active_shards',
    accessorKey: 'active_shards',
    header: '活跃分片',
    cell: ({ row }) => {
      const shards = row.getValue('active_shards') as string[] | undefined
      if (!shards || shards.length === 0)
        return <span className='text-muted-foreground'>-</span>
      return (
        <div className='flex flex-wrap gap-1'>
          {shards.slice(0, 3).map((s, idx) => (
            <span
              key={idx}
              className='rounded bg-muted px-1.5 py-0.5 font-mono text-xs'
            >
              {s}
            </span>
          ))}
          {shards.length > 3 && (
            <span className='text-xs text-muted-foreground'>
              +{shards.length - 3}
            </span>
          )}
        </div>
      )
    },
    size: 240,
  },
  {
    id: 'enabled',
    accessorKey: 'enabled',
    header: '开关',
    cell: ({ row }) => (
      <ParamModelRegisterEnabledSwitch register={row.original} />
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableHiding: false,
    size: 60,
  },
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: '创建时间',
    cell: ({ row }) => <DatetimeCell value={row.getValue('created_at')} />,
  },
  {
    id: 'updated_at',
    accessorKey: 'updated_at',
    header: '更新时间',
    cell: ({ row }) => <DatetimeCell value={row.getValue('updated_at')} />,
  },
  {
    id: 'actions',
    enableHiding: false,
    header: '操作',
    cell: ({ row }) => <ParamModelRegisterRowActions row={row} />,
    size: 54,
  },
]
