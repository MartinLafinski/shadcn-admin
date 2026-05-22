import type { ColumnDef, Row } from '@tanstack/react-table'
import {
  materialDictionary,
  onSuccessDictionary,
  onFailureDictionary,
} from '@/lib/labels.tsx'
import { Badge } from '@/components/ui/badge'
import { DatetimeCell } from '@/components/smart/cells/datetime-cell'
import { EntityEnabledStatusCell } from '@/components/smart/cells/entity-enabled-status-cell'
import { EntityIdCell } from '@/components/smart/cells/entity-id-cell'
import { EntityInheritStatusCell } from '@/components/smart/cells/entity-inherit-status-cell'
import { EntityLimitedCell } from '@/components/smart/cells/entity-limited-cell'
import { EntityLockedCell } from '@/components/smart/cells/entity-locked-cell'
import { EntityMaterialCountCell } from '@/components/smart/cells/entity-material-count-cell'
import { EntityPausedCell } from '@/components/smart/cells/entity-paused-cell'
import { EntitySelectCell } from '@/components/smart/cells/entity-select-cell'
import { EntitySelectHeader } from '@/components/smart/cells/entity-select-header'
import { EntitySelfStatusCell } from '@/components/smart/cells/entity-self-status-cell'
import { EntitySpiderTaskBarCell } from '@/components/smart/cells/entity-spider-task-bar-cell'
import { EntitySpiderTaskBarHeader } from '@/components/smart/cells/entity-spider-task-bar-header'
import { EntitySpiderTasksPieCell } from '@/components/smart/cells/entity-spider-tasks-pie-cell.tsx'
import { EntityTaskLockedCell } from '@/components/smart/cells/entity-task-locked-cell'
import { EntrypointMiniItemCell } from '@/components/smart/cells/entrypoint-mini-item-cell'
// 行业单元格
import { IndustryMiniItemCell } from '@/components/smart/cells/industry-mini-item-cell'
import { JobGroupMiniItemCell } from '@/components/smart/cells/jobgroup-mini-item-cell'
import { MaterialCell } from '@/components/smart/cells/material-cell.tsx'
// 参数要素单元格
import { ParamFormMiniItemCell } from '@/components/smart/cells/param-form-mini-item-cell'
import { PrejobMiniItemCell } from '@/components/smart/cells/prejob-mini-item-cell'
import { WebsiteMiniItemCell } from '@/components/smart/cells/website-mini-item-cell'
import { levelLabels } from '../data/labels'
import type { PrejobItemData } from '../data/schemas'
import { PrejobsRowActions } from './actions/prejobs-row-actions'
import { PrejobEnabledSwitch } from './cells/prejob-enabled-switch'
import { usePrejobsActions } from './prejobs-provider'

export const prejobsColumns: ColumnDef<PrejobItemData>[] = [
  {
    id: 'select',
    header: ({ table }) => <EntitySelectHeader table={table} />,
    cell: ({ row }) => <EntitySelectCell row={row} />,
    size: 40,
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: 'prejob_id',
    accessorKey: 'prejob_id',
    header: 'ID',
    cell: ({ row }) => <EntityIdCell value={row.getValue('prejob_id')} />,
    enableHiding: false,
    size: 60,
  },
  {
    id: 'prejob_status_mini',
    accessorKey: 'prejob_status_mini',
    header: '聚合状态',
    cell: ({ row }) => <EntityInheritStatusCell entity={row.original} />,
    enableHiding: false,
    size: 40,
  },
  {
    id: 'prejob_name',
    accessorKey: 'prejob_name',
    header: '预备作业',
    cell: ({ row }) => {
      const { setOpen, setCurrentRow } = usePrejobsActions()
      return (
        <PrejobMiniItemCell
          prejob={row.original}
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
    accessorKey: 'jobgroup',
    header: '作业分组',
    cell: ({ row }) => {
      const jobgroup = row.original.jobgroup || null
      const prejob = row.original
      const { setOpen, setCurrentRow } = usePrejobsActions()
      return (
        <JobGroupMiniItemCell
          group={jobgroup}
          isPrimary={false}
          onClick={() => {
            setCurrentRow(prejob)
            setOpen('viewJobGroup')
          }}
        />
      )
    },
    size: 120,
  },
  {
    id: 'entrypoint',
    accessorKey: 'entrypoint',
    header: '入口点',
    cell: ({ row }) => {
      const entrypoint = row.original.entrypoint
      const { setOpen, setCurrentRow } = usePrejobsActions()
      if (!entrypoint) return <span>-</span>
      return (
        <EntrypointMiniItemCell
          entrypoint={entrypoint}
          isPrimary={false}
          onClick={() => {
            setCurrentRow(row.original)
            setOpen('viewEntrypoint')
          }}
        />
      )
    },
    size: 120,
  },
  {
    id: 'website',
    accessorKey: 'entrypoint',
    header: '网站',
    cell: ({ row }) => {
      const website = row.original.entrypoint?.website || null
      const { setOpen, setCurrentRow } = usePrejobsActions()
      return (
        <WebsiteMiniItemCell
          website={website}
          isPrimary={false}
          onClick={() => {
            setCurrentRow(row.original)
            setOpen('viewWebsite')
          }}
        />
      )
    },
    size: 120,
  },

  {
    accessorKey: 'industry',
    header: '所在行业',
    cell: ({ row }) => {
      const industry = row.original.entrypoint?.industry || null
      const prejob = row.original
      const { setOpen, setCurrentRow } = usePrejobsActions()
      return (
        <IndustryMiniItemCell
          industry={industry}
          isPrimary={false}
          onClick={() => {
            setCurrentRow(prejob)
            setOpen('viewIndustry')
          }}
        />
      )
    },
  },
  {
    id: 'material_type',
    accessorKey: 'material_type',
    header: '主采类型',
    filterFn: (row, id, value) => {
      return value.includes(!!row.getValue(id))
    },
    cell: ({ row }) => <MaterialCell value={row.getValue('material_type')} />,
    size: 90,
    meta: {
      className: 'border-r-1',
    },
  },
  {
    id: 'prejob_level',
    accessorKey: 'prejob_level',
    header: '优先级',
    cell: ({ row }) => {
      const level = row.getValue('prejob_level') as string
      const label = levelLabels.find((l) => l.value === level)
      return label ? (
        <Badge variant='ghost' className={label.className}>
          {label.label} <label.icon className='ml-1 h-3 w-3' />
        </Badge>
      ) : (
        <span>-</span>
      )
    },
    size: 80,
  },
  /**
   * 任务独占
   */
  {
    id: 'task_locked',
    accessorKey: 'task_locked',
    header: '任务独占',
    cell: ({ row }) => <EntityTaskLockedCell entity={row.original} />,
    size: 120,
  },
  {
    id: 'task_limits',
    header: '任务上限',
    cell: ({ row }) => {
      const website = row.original.max_tasks_in_website
      const entrypoint = row.original.max_tasks_in_entrypoint
      const jobgroup = row.original.max_tasks_in_jobgroup
      return (
        <div className='flex gap-0.5 text-xs text-muted-foreground'>
          <span className='text-foreground'>
            {website === 0 ? '-' : website}
          </span>{' '}
          /
          <span className='text-foreground'>
            {entrypoint === 0 ? '-' : entrypoint}
          </span>{' '}
          /
          <span className='text-foreground'>
            {jobgroup === 0 ? '-' : jobgroup}
          </span>
        </div>
      )
    },
    size: 100,
    meta: {
      className: 'border-r-1',
    },
  },
  {
    id: 'working_spider_task_pie',
    header: '在线/上限',
    cell: ({ row }) => (
      <EntitySpiderTasksPieCell
        workingSpiders={row.original.working_spider_task_count || 3}
        maxSpiders={row.original.prejob_max_spider_task_count || 7}
      />
    ),
    size: 60,
  },
  {
    id: '爬虫任务分布',
    accessorKey: '爬虫任务分布',
    header: () => <EntitySpiderTaskBarHeader />,
    cell: ({ row }) => <EntitySpiderTaskBarCell taskCounter={row.original} />,
    size: 150,
    meta: {
      className: 'border-r-1',
    },
  },

  {
    id: 'prejob_enabled_status',
    accessorKey: 'prejob_enabled_status',
    header: '可用',
    cell: ({ row }) => (
      <EntityEnabledStatusCell entity_type='prejob' entity={row.original} />
    ),
    size: 40,
  },
  {
    id: 'prejob_locked',
    accessorKey: 'prejob_locked',
    header: '锁定',
    cell: ({ row }) => (
      <EntityLockedCell entity_type='prejob' entity={row.original} />
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    size: 40,
  },
  {
    id: 'prejob_paused',
    accessorKey: 'prejob_paused',
    header: '运转',
    cell: ({ row }) => (
      <EntityPausedCell entity_type='prejob' entity={row.original} />
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    size: 40,
  },
  {
    id: 'prejob_limited',
    accessorKey: 'prejob_limited',
    header: '未限',
    cell: ({ row }) => (
      <EntityLimitedCell entity_type='prejob' entity={row.original} />
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    size: 40,
    meta: {
      className: 'border-r-1',
    },
  },
  {
    id: 'total_material_count',
    accessorKey: 'total_material_count',
    header: '总采料',
    cell: ({ row }) => (
      <EntityMaterialCountCell
        entity={row.original}
        linkTo='/material/index'
        linkSearch={{ website_id: row.original.entrypoint?.website_id }}
        countKey='total_material_count'
        icon={materialDictionary.all.icon}
        className={materialDictionary.all.className}
      />
    ),
    size: 60,
  },
  {
    id: 'material_subs_count',
    accessorKey: 'material_subs_count',
    header: '子料',
    cell: ({ row }) => (
      <EntityMaterialCountCell
        entity={row.original}
        linkTo='/material/subs'
        linkSearch={{ website_id: row.original.entrypoint?.website_id }}
        countKey='material_subs_count'
        icon={materialDictionary.subs.icon}
        className={materialDictionary.subs.className}
      />
    ),
    size: 60,
    meta: {
      className: 'border-r-1',
    },
  },
  {
    id: 'material_unknown_count',
    accessorKey: 'material_unknown_count',
    header: '未知',
    cell: ({ row }) => (
      <EntityMaterialCountCell
        entity={row.original}
        linkTo='/material/unknown'
        linkSearch={{ website_id: row.original.entrypoint?.website_id }}
        countKey='material_unknown_count'
        icon={materialDictionary.unknown.icon}
        className={materialDictionary.unknown.className}
      />
    ),
    size: 60,
  },
  {
    id: 'material_customize_count',
    accessorKey: 'material_customize_count',
    header: '自定义',
    cell: ({ row }) => (
      <EntityMaterialCountCell
        entity={row.original}
        linkTo='/material/customize'
        linkSearch={{ website_id: row.original.entrypoint?.website_id }}
        countKey='material_customize_count'
        icon={materialDictionary.customize.icon}
        className={materialDictionary.customize.className}
      />
    ),
    size: 60,
    meta: {
      className: 'border-r-1',
    },
  },
  {
    id: 'material_speech_count',
    accessorKey: 'material_speech_count',
    header: '语料',
    cell: ({ row }) => (
      <EntityMaterialCountCell
        entity={row.original}
        linkTo='/material/speech'
        linkSearch={{ website_id: row.original.entrypoint?.website_id }}
        countKey='material_speech_count'
        icon={materialDictionary.speech.icon}
        className={materialDictionary.speech.className}
      />
    ),
    size: 60,
  },
  {
    id: 'material_news_count',
    accessorKey: 'material_news_count',
    header: '讯料',
    cell: ({ row }) => (
      <EntityMaterialCountCell
        entity={row.original}
        linkTo='/material/news'
        linkSearch={{ website_id: row.original.entrypoint?.website_id }}
        countKey='material_news_count'
        icon={materialDictionary.news.icon}
        className={materialDictionary.news.className}
      />
    ),
    size: 60,
  },
  {
    id: 'material_note_count',
    accessorKey: 'material_note_count',
    header: '笔料',
    cell: ({ row }) => (
      <EntityMaterialCountCell
        entity={row.original}
        linkTo='/material/note'
        linkSearch={{ website_id: row.original.entrypoint?.website_id }}
        countKey='material_note_count'
        icon={materialDictionary.note.icon}
        className={materialDictionary.note.className}
      />
    ),
    size: 60,
  },
  {
    id: 'material_article_count',
    accessorKey: 'material_article_count',
    header: '文料',
    cell: ({ row }) => (
      <EntityMaterialCountCell
        entity={row.original}
        linkTo='/material/article'
        linkSearch={{ website_id: row.original.entrypoint?.website_id }}
        countKey='material_article_count'
        icon={materialDictionary.article.icon}
        className={materialDictionary.article.className}
      />
    ),
    size: 60,
    meta: {
      className: 'border-r-1',
    },
  },
  {
    id: 'material_book_count',
    accessorKey: 'material_book_count',
    header: '书料',
    cell: ({ row }) => (
      <EntityMaterialCountCell
        entity={row.original}
        linkTo='/material/book'
        linkSearch={{ website_id: row.original.entrypoint?.website_id }}
        countKey='material_book_count'
        icon={materialDictionary.book.icon}
        className={materialDictionary.book.className}
      />
    ),
    size: 60,
  },
  {
    id: 'material_bid_count',
    accessorKey: 'material_bid_count',
    header: '标料',
    cell: ({ row }) => (
      <EntityMaterialCountCell
        entity={row.original}
        linkTo='/material/bid'
        linkSearch={{ website_id: row.original.entrypoint?.website_id }}
        countKey='material_bid_count'
        icon={materialDictionary.bid.icon}
        className={materialDictionary.bid.className}
      />
    ),
    size: 60,
    meta: {
      className: 'border-r-1',
    },
  },
  {
    id: 'material_trade_count',
    accessorKey: 'material_trade_count',
    header: '贸料',
    cell: ({ row }) => (
      <EntityMaterialCountCell
        entity={row.original}
        linkTo='/material/trade'
        linkSearch={{ website_id: row.original.entrypoint?.website_id }}
        countKey='material_trade_count'
        icon={materialDictionary.trade.icon}
        className={materialDictionary.trade.className}
      />
    ),
    size: 60,
  },
  {
    id: 'material_product_count',
    accessorKey: 'material_product_count',
    header: '产料',
    cell: ({ row }) => (
      <EntityMaterialCountCell
        entity={row.original}
        linkTo='/material/product'
        linkSearch={{ website_id: row.original.entrypoint?.website_id }}
        countKey='material_product_count'
        icon={materialDictionary.product.icon}
        className={materialDictionary.product.className}
      />
    ),
    size: 60,
  },
  {
    id: 'material_company_count',
    accessorKey: 'material_company_count',
    header: '企料',
    cell: ({ row }) => (
      <EntityMaterialCountCell
        entity={row.original}
        linkTo='/material/company'
        linkSearch={{ website_id: row.original.entrypoint?.website_id }}
        countKey='material_company_count'
        icon={materialDictionary.company.icon}
        className={materialDictionary.company.className}
      />
    ),
    size: 60,
  },
  {
    id: 'material_shop_count',
    accessorKey: 'material_shop_count',
    header: '店料',
    cell: ({ row }) => (
      <EntityMaterialCountCell
        entity={row.original}
        linkTo='/material/shop'
        linkSearch={{ website_id: row.original.entrypoint?.website_id }}
        countKey='material_shop_count'
        icon={materialDictionary.shop.icon}
        className={materialDictionary.shop.className}
      />
    ),
    size: 60,
    meta: {
      className: 'border-r-1',
    },
  },
  {
    id: 'material_recruit_count',
    accessorKey: 'material_recruit_count',
    header: '聘料',
    cell: ({ row }) => (
      <EntityMaterialCountCell
        entity={row.original}
        linkTo='/material/recruit'
        linkSearch={{ website_id: row.original.entrypoint?.website_id }}
        countKey='material_recruit_count'
        icon={materialDictionary.recruit.icon}
        className={materialDictionary.recruit.className}
      />
    ),
    size: 60,
  },
  {
    id: 'material_account_count',
    accessorKey: 'material_account_count',
    header: '户料',
    cell: ({ row }) => (
      <EntityMaterialCountCell
        entity={row.original}
        linkTo='/material/account'
        linkSearch={{ website_id: row.original.entrypoint?.website_id }}
        countKey='material_account_count'
        icon={materialDictionary.account.icon}
        className={materialDictionary.account.className}
      />
    ),
    size: 60,
    meta: {
      className: 'border-r-1',
    },
  },
  {
    id: 'material_image_count',
    accessorKey: 'material_image_count',
    header: '图料',
    cell: ({ row }) => (
      <EntityMaterialCountCell
        entity={row.original}
        linkTo='/material/image'
        linkSearch={{ website_id: row.original.entrypoint?.website_id }}
        countKey='material_image_count'
        icon={materialDictionary.image.icon}
        className={materialDictionary.image.className}
      />
    ),
    size: 60,
  },
  {
    id: 'material_audio_count',
    accessorKey: 'material_audio_count',
    header: '音料',
    cell: ({ row }) => (
      <EntityMaterialCountCell
        entity={row.original}
        linkTo='/material/audio'
        linkSearch={{ website_id: row.original.entrypoint?.website_id }}
        countKey='material_audio_count'
        icon={materialDictionary.audio.icon}
        className={materialDictionary.audio.className}
      />
    ),
    size: 60,
  },
  {
    id: 'material_video_count',
    accessorKey: 'material_video_count',
    header: '影料',
    cell: ({ row }) => (
      <EntityMaterialCountCell
        entity={row.original}
        linkTo='/material/video'
        linkSearch={{ website_id: row.original.entrypoint?.website_id }}
        countKey='material_video_count'
        icon={materialDictionary.video.icon}
        className={materialDictionary.video.className}
      />
    ),
    size: 60,
    meta: {
      className: 'border-r-1',
    },
  },
  {
    id: 'material_file_count',
    accessorKey: 'material_file_count',
    header: '资料',
    cell: ({ row }) => (
      <EntityMaterialCountCell
        entity={row.original}
        linkTo='/material/file'
        linkSearch={{ website_id: row.original.entrypoint?.website_id }}
        countKey='material_file_count'
        icon={materialDictionary.file.icon}
        className={materialDictionary.file.className}
      />
    ),
    size: 60,
    meta: {
      className: 'border-r-1',
    },
  },

  /**
   * 自用参数要素包列
   */
  {
    id: 'prejob_self_param_slug',
    accessorKey: 'prejob_self_param_slug',
    header: '行业自用要素包',
    cell: ({ row }) => (
      <ParamFormMiniItemCell
        entity={row.original.param_form_self}
        isPrimary={false}
        asLink={true}
      />
    ),
    size: 160,
  },
  {
    accessorKey: 'interval',
    header: '触发间隔',
    cell: ({ row }) => <span>{row.getValue('interval') as number}s</span>,
    size: 80,
  },

  {
    accessorKey: 'on_success',
    header: '成功处理',
    cell: ({ row }) => {
      const v = row.getValue('on_success') as string
      return (
        <div className='flex flex-col gap-0.5 text-xs'>
          <span>{onSuccessDictionary[v] ?? v}</span>
          <code className='text-muted-foreground'>{v}</code>
        </div>
      )
    },
    size: 100,
  },
  {
    accessorKey: 'on_failure',
    header: '失败处理',
    cell: ({ row }) => {
      const v = row.getValue('on_failure') as string
      return (
        <div className='flex flex-col gap-0.5 text-xs'>
          <span>{onFailureDictionary[v] ?? v}</span>
          <code className='text-muted-foreground'>{v}</code>
        </div>
      )
    },
    size: 80,
  },
  /**
   * 创建时间列 - 显示行业创建时间
   * 使用 SmartDatetime 组件格式化时间，并设置为上海时区
   */
  {
    accessorKey: 'last_trigger_at',
    header: '上次触发时间',
    cell: ({ row }) => <DatetimeCell value={row.getValue('last_trigger_at')} />,
  },
  {
    accessorKey: 'next_trigger_at',
    header: '下次触发时间',
    cell: ({ row }) => <DatetimeCell value={row.getValue('next_trigger_at')} />,
    meta: {
      className: 'border-r-1',
    },
  },

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
    id: 'prejob_status',
    accessorKey: 'prejob_status',
    header: '自身状态',
    cell: ({ row }) => (
      <EntitySelfStatusCell entity_type='prejob' entity={row.original} />
    ),
    enableHiding: false,
    size: 50,
  },
  {
    id: 'prejob_enabled',
    accessorKey: 'prejob_enabled',
    header: '开关',
    cell: ({ row }) => <PrejobEnabledSwitch prejob={row.original} />,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableHiding: false,
    size: 60,
    maxSize: 60,
  },
  {
    id: 'actions',
    header: '操作',
    cell: ({ row }) => <PrejobsRowActions row={row as Row<PrejobItemData>} />,
    size: 54,
    maxSize: 54,
    enableSorting: false,
    enableHiding: false,
  },
]
