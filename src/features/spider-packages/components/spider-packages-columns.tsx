import type { ColumnDef, Row } from '@tanstack/react-table'
import { BoxesIcon } from 'lucide-react'
import { CounterCell } from '@/components/smart/cells/counter-cell'
import { DatetimeCell } from '@/components/smart/cells/datetime-cell'
import { EntityIdCell } from '@/components/smart/cells/entity-id-cell'
import { EntitySelectCell } from '@/components/smart/cells/entity-select-cell'
import { EntitySelectHeader } from '@/components/smart/cells/entity-select-header'
import { SpiderPackageMiniItemCell } from '@/components/smart/cells/spider-package-mini-item-cell'
// URL单元格
import { UrlCell } from '@/components/smart/cells/url-cell'
import { WebsiteMiniItemCell } from '@/components/smart/cells/website-mini-item-cell'
import type { SpiderPackageItemData } from '../data/schemas'
import { SpiderPackagesRowActions } from './actions/spider-packages-row-actions'
import { SpiderPackageEnabledSwitch } from './cells/spider-package-enabled-switch'
import { useSpiderPackagesActions } from './spider-packages-provider'

export const spiderPackagesColumns: ColumnDef<SpiderPackageItemData>[] = [
  {
    id: 'select',
    header: ({ table }) => <EntitySelectHeader table={table} />,
    cell: ({ row }) => <EntitySelectCell row={row} />,
    size: 40,
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: 'spider_package_id',
    accessorKey: 'spider_package_id',
    header: 'ID',
    cell: ({ row }) => (
      <EntityIdCell value={row.getValue('spider_package_id')} />
    ),
    size: 60,
    enableHiding: false,
  },
  {
    id: 'spider_package_name',
    accessorKey: 'spider_package_name',
    header: '爬虫包',
    cell: ({ row }) => {
      const { setOpen, setCurrentRow } = useSpiderPackagesActions()
      return (
        <SpiderPackageMiniItemCell
          entity={row.original}
          isPrimary={true}
          onClick={() => {
            setCurrentRow(row.original)
            setOpen('configInfo')
          }}
        />
      )
    },
    enableHiding: false,
    size: 200,
  },
  {
    id: 'website',
    accessorKey: 'website',
    header: '网站',
    cell: ({ row }) => {
      const { setOpen, setCurrentRow } = useSpiderPackagesActions()
      const website = row.original.website
      return (
        <WebsiteMiniItemCell
          website={website ?? null}
          isPrimary={false}
          onClick={
            website
              ? () => {
                  setCurrentRow(row.original)
                  setOpen('viewWebsite')
                }
              : undefined
          }
        />
      )
    },
    size: 120,
  },
  {
    id: 'releases_count',
    accessorKey: 'releases',
    header: '发布',
    cell: ({ row }) => {
      const releases = row.getValue(
        'releases_count'
      ) as SpiderPackageItemData['releases']
      const count = releases?.length || 0
      const { setOpen, setCurrentRow } = useSpiderPackagesActions()
      return (
        <CounterCell
          count={count}
          icon={BoxesIcon}
          className='bg-cyan-100 text-cyan-950 dark:bg-cyan-200/70'
          onClick={() => {
            setCurrentRow(row.original)
            setOpen('releases')
          }}
        />
      )
    },
    size: 60,
    meta: {
      className: 'border-r-1',
    },
  },
  {
    id: 'spider_package_version',
    accessorKey: 'spider_package_version',
    header: '版本号',
    size: 60,
    cell: ({ getValue }) => (
      <code className='rounded bg-muted px-1.5 py-0.5 text-xs'>
        {getValue() as string}
      </code>
    ),
  },

  {
    accessorKey: 'spider_package_url',
    header: '包地址',
    cell: ({ row }) => <UrlCell url={row.getValue('spider_package_url')} />,
    size: 320,
    maxSize: 320,
    meta: {
      className: 'border-r-1',
    },
  },

  // {
  //   id: 'latest_release_version',
  //   accessorKey: 'latest_release',
  //   header: '最新发布',
  //   cell: ({ row }) => {
  //     const lr = row.getValue(
  //       'latest_release'
  //     ) as SpiderPackageItemData['latest_release']
  //     if (!lr) {
  //       return (
  //         <Badge variant='outline' className='text-gray-400'>
  //           -
  //         </Badge>
  //       )
  //     }
  //     return (
  //       <Badge
  //         variant='outline'
  //         className='border-blue-200 bg-blue-100 text-blue-800 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
  //       >
  //         {lr.release_version}
  //       </Badge>
  //     )
  //   },
  //   size: 120,
  //   meta: {
  //     className: 'border-r-1',
  //   },
  // },

  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: '创建时间',
    cell: ({ row }) => <DatetimeCell value={row.getValue('created_at')} />,
    size: 140,
  },
  {
    id: 'updated_at',
    accessorKey: 'updated_at',
    header: '更新时间',
    cell: ({ row }) => <DatetimeCell value={row.getValue('updated_at')} />,
    size: 140,
  },
  {
    id: 'spider_package_enabled',
    accessorKey: 'spider_package_enabled',
    header: '开关',
    cell: ({ row }) => (
      <SpiderPackageEnabledSwitch spiderPackage={row.original} />
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    size: 60,
    maxSize: 60,
  },
  {
    id: 'actions',
    header: '操作',
    cell: ({ row }) => (
      <SpiderPackagesRowActions row={row as Row<SpiderPackageItemData>} />
    ),
    size: 54,
    maxSize: 54,
    enableSorting: false,
    enableHiding: false,
  },
]
