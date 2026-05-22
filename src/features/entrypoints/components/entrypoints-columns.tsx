// 表格列
import { type ColumnDef } from '@tanstack/react-table'
// 图标
import { ListTodoIcon } from 'lucide-react'
// 采料类型字典
import { materialDictionary } from '@/lib/labels.tsx'
import { DatetimeCell } from '@/components/smart/cells/datetime-cell'
import { EntityEnabledStatusCell } from '@/components/smart/cells/entity-enabled-status-cell'
// 实体ID单元格
import { EntityIdCell } from '@/components/smart/cells/entity-id-cell'
// 聚合状态单元格
import { EntityInheritStatusCell } from '@/components/smart/cells/entity-inherit-status-cell.tsx'
// 条目信息单元格
import { EntityItemCountCell } from '@/components/smart/cells/entity-items-count-cell'
// 禁用状态单元格
import { EntityLimitedCell } from '@/components/smart/cells/entity-limited-cell'
// 锁定状态单元格
import { EntityLockedCell } from '@/components/smart/cells/entity-locked-cell'
// 材料数量单元格
import { EntityMaterialCountCell } from '@/components/smart/cells/entity-material-count-cell'
// 暂停状态单元格
import { EntityPausedCell } from '@/components/smart/cells/entity-paused-cell'
// 实体选择单元格
import { EntitySelectCell } from '@/components/smart/cells/entity-select-cell'
// 实体选择表头
import { EntitySelectHeader } from '@/components/smart/cells/entity-select-header'
// 网站聚合状态单元格
import { EntitySelfStatusCell } from '@/components/smart/cells/entity-self-status-cell'
// 爬虫任务进度条单元格
import { EntitySpiderTaskBarCell } from '@/components/smart/cells/entity-spider-task-bar-cell'
// 迷你信息单元格
import { EntitySpiderTaskBarHeader } from '@/components/smart/cells/entity-spider-task-bar-header'
// 爬虫任务进度条单元格
import { EntitySpiderTasksPieCell } from '@/components/smart/cells/entity-spider-tasks-pie-cell'
// 入口点迷你信息单元格
import { EntrypointMiniItemCell } from '@/components/smart/cells/entrypoint-mini-item-cell'
// 行业单元格
import { IndustryMiniItemCell } from '@/components/smart/cells/industry-mini-item-cell'
// 材料类型单元格
import { MaterialCell } from '@/components/smart/cells/material-cell.tsx'
// 参数要素单元格
import { ParamFormMiniItemCell } from '@/components/smart/cells/param-form-mini-item-cell'
// URL 单元格
import { UrlCell } from '@/components/smart/cells/url-cell.tsx'
// 网站迷你信息单元格
import { WebsiteMiniItemCell } from '@/components/smart/cells/website-mini-item-cell'
// 自定义时间控件
import { SmartDatetime } from '@/components/smart/datetime.tsx'
// 入口点数据结构
import { type EntrypointItemData } from '@/features/entrypoints/data/schemas'
// 行业数据结构
import { type IndustryItemData } from '@/features/industries/data/schemas'
// 自定义行操作控件
import { EntrypointsRowActions } from './actions/entrypoints-row-actions.tsx'
// 启用状态切换控件
import { EntrypointEnabledSwitch } from './cells/entrypoint-enabled-switch'
import { useEntrypointsActions } from './entrypoints-provider'

/**
 * 入口点列表表格列定义
 *
 * 定义了入口点管理页面表格的所有列，包括：
 * - 选择列：支持全选和单选
 * - 基础信息列：ID、名称、标识、URL
 * - 状态列：启用/禁用开关
 * - 时间列：创建时间和更新时间
 * - 操作列：配置说明查看和行操作
 *
 * 使用 TanStack Table 的 ColumnDef 类型定义
 */
export const entrypointsColumns: ColumnDef<EntrypointItemData>[] = [
  /**
   * 选择列 - 用于批量操作
   * 包含表头全选复选框和行选择复选框
   */
  {
    id: 'select',
    header: ({ table }) => <EntitySelectHeader table={table} />,
    cell: ({ row }) => <EntitySelectCell row={row} />,
    enableSorting: false, // 选择列不支持排序
    enableHiding: false, // 选择列不允许隐藏
    size: 40,
  },
  /**
   * 入口点ID列 - 显示入口点的唯一标识符
   * 居中显示，便于快速识别
   */
  {
    id: 'entrypoint_id',
    accessorKey: 'entrypoint_id',
    header: 'ID',
    cell: ({ row }) => <EntityIdCell value={row.getValue('entrypoint_id')} />,
    // minSize: 30,
    // maxSize: 50,
    size: 60,
  },
  /**
   * 入口点名称列 - 显示入口点的显示名称和标识
   * 使用 EntrypointMiniItemCell 组件展示头像、名称和slug
   */
  {
    id: 'entrypoint_name',
    accessorKey: 'entrypoint_name',
    header: '入口点名称',
    cell: ({ row }) => {
      const { setOpen, setCurrentRow } = useEntrypointsActions()
      return (
        <EntrypointMiniItemCell
          entrypoint={row.original}
          isPrimary={true}
          onClick={() => {
            setCurrentRow(row.original)
            setOpen('viewEntrypoint')
          }}
        />
      )
    },
    size: 200,
  },
  /**
   * 迷你状态列 - 2x2 纯色块 + 申请状态
   */
  {
    id: 'entrypoint_status_mini',
    header: '聚合状态',
    cell: ({ row }) => <EntityInheritStatusCell entity={row.original} />,
    size: 100,
  },

  /**
   * 网站名称列 - 显示网站的显示名称和标识
   * 使用 WebsiteMiniItemCell 组件展示头像、名称和slug
   */
  {
    id: 'website',
    accessorKey: 'website',
    header: '所属网站',
    cell: ({ row }) => {
      const entrypoint = row.original
      const { setOpen, setCurrentRow } = useEntrypointsActions()
      return (
        <WebsiteMiniItemCell
          website={row.original.website}
          isPrimary={false}
          onClick={() => {
            setCurrentRow(entrypoint) // 设置当前选中的行数据
            setOpen('viewWebsite') // 打开查看网站信息对话框
          }}
        />
      )
    },
    size: 200,
  },

  /**
   * 行业列 - 显示行业名称
   */
  {
    accessorKey: 'industry',
    header: '所在行业',
    cell: ({ row }) => {
      const industry = row.getValue('industry') as IndustryItemData | null
      const entrypoint = row.original
      const { setOpen, setCurrentRow } = useEntrypointsActions()
      return (
        <IndustryMiniItemCell
          industry={industry}
          isPrimary={false}
          onClick={() => {
            setCurrentRow(entrypoint)
            setOpen('viewIndustry')
          }}
        />
      )
    },
  },

  /**
   * 材料类型列 - 显示材料类型
   */
  {
    id: 'material_type',
    accessorKey: 'material_type',
    header: '主采类型',
    filterFn: (row, id, value) => {
      return value.includes(!!row.getValue(id))
    },
    cell: ({ row }) => <MaterialCell value={row.getValue('material_type')} />,
    size: 90,
  },

  /**
   * 预备作业数量列 - 显示网站下属的预备作业数量
   * 居中显示，便于快速识别
   */
  {
    id: 'prejob_count',
    accessorKey: 'prejob_count',
    header: '预备作业',
    cell: ({ row }) => (
      <EntityItemCountCell
        count={row.getValue('prejob_count')}
        to='/prejobs'
        searchParams={{ entrypoint_id: row.original.entrypoint_id }}
        icon={ListTodoIcon}
        className='bg-green-100 dark:bg-green-800'
      />
    ),
    size: 60,
    meta: {
      className: 'border-r-1',
    },
  },

  /**
   * 入口点在线任务饼图列 - 可视化显示在线任务占比
   */
  {
    id: 'working_spider_task_pie',
    header: '在线/上限',
    cell: ({ row }) => (
      <EntitySpiderTasksPieCell
        workingSpiders={row.original.working_spider_task_count || 3}
        maxSpiders={row.original.entrypoint_max_spider_task_count || 7}
      />
    ),
    size: 60,
  },

  /**
   * 入口点任务进度条列 - 显示成功/失败/中断/取消的比例
   */
  {
    id: 'spider_task_progress',
    // header: '总任务 - 成功 - 失败 - 中断 - 取消',
    header: () => <EntitySpiderTaskBarHeader />,
    cell: ({ row }) => <EntitySpiderTaskBarCell taskCounter={row.original} />,
    size: 150,
    meta: {
      className: 'border-r-1',
    },
  },

  /**
   * 是否可用
   */
  {
    id: 'entrypoint_enabled_status',
    accessorKey: 'entrypoint_enabled',
    header: '可用',
    cell: ({ row }) => (
      <EntityEnabledStatusCell entity_type='entrypoint' entity={row.original} />
    ),
    size: 40,
  },

  /**
   * 是否锁定
   */
  {
    accessorKey: 'entrypoint_locked',
    filterFn: (row, id, value) => {
      return value.includes(!!row.getValue(id)) // 自定义过滤函数
    },
    header: '锁定',
    cell: ({ row }) => (
      <EntityLockedCell entity_type='entrypoint' entity={row.original} />
    ),
    size: 40,
  },

  /**
   * 是否暂停任务追加
   */
  {
    id: 'entrypoint_paused',
    accessorKey: 'entrypoint_paused',
    filterFn: (row, id, value) => {
      return value.includes(!!row.getValue(id)) // 自定义过滤函数
    },
    header: '运转',
    cell: ({ row }) => (
      <EntityPausedCell entity_type='entrypoint' entity={row.original} />
    ),
    size: 40,
  },
  /**
   * 是否受限
   */
  {
    id: 'entrypoint_limited',
    accessorKey: 'entrypoint_limited',
    header: '未限',
    filterFn: (row, id, value) => {
      return value.includes(!!row.getValue(id)) // 自定义过滤函数
    },
    cell: ({ row }) => (
      <EntityLimitedCell entity_type='entrypoint' entity={row.original} />
    ),
    size: 40,
  },

  /**
   * 所有材料数量列 - 显示网站下所有材料数量
   */
  {
    id: 'total_material_count',
    accessorKey: 'total_material_count',
    header: '总采料',
    cell: ({ row }) => (
      <EntityMaterialCountCell
        entity={row.original}
        linkTo='/material/index'
        linkSearch={{ website_id: row.original.website_id }}
        countKey='total_material_count'
        icon={materialDictionary.all.icon}
        className={materialDictionary.all.className}
      />
    ),
    size: 60,
  },
  /**
   * 子料数量列
   */
  {
    id: 'material_subs_count',
    accessorKey: 'material_subs_count',
    header: '子料',
    cell: ({ row }) => (
      <EntityMaterialCountCell
        entity={row.original}
        linkTo='/material/subs'
        linkSearch={{ website_id: row.original.website_id }}
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

  /**
   * 未知材料数量列 - 显示网站下未知材料数量
   */
  {
    id: 'material_unknown_count',
    accessorKey: 'material_unknown_count',
    header: '未知',
    cell: ({ row }) => (
      <EntityMaterialCountCell
        entity={row.original}
        linkTo='/material/unknown'
        linkSearch={{ website_id: row.original.website_id }}
        countKey='material_unknown_count'
        icon={materialDictionary.unknown.icon}
        className={materialDictionary.unknown.className}
      />
    ),
    size: 60,
  },
  /**
   * 自定义采料数量列
   */
  {
    id: 'material_customize_count',
    accessorKey: 'material_customize_count',
    header: '自定义',
    cell: ({ row }) => (
      <EntityMaterialCountCell
        entity={row.original}
        linkTo='/material/customize'
        linkSearch={{ website_id: row.original.website_id }}
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

  /**
   * 语料数量列 - 显示网站下语料数量
   */
  {
    id: 'material_speech_count',
    accessorKey: 'material_speech_count',
    header: '语料',
    cell: ({ row }) => (
      <EntityMaterialCountCell
        entity={row.original}
        linkTo='/material/speech'
        linkSearch={{ website_id: row.original.website_id }}
        countKey='material_speech_count'
        icon={materialDictionary.speech.icon}
        className={materialDictionary.speech.className}
      />
    ),
    size: 60,
  },
  /**
   * 讯料数量列 - 显示网站下讯料数量
   */
  {
    id: 'material_news_count',
    accessorKey: 'material_news_count',
    header: '讯料',
    cell: ({ row }) => (
      <EntityMaterialCountCell
        entity={row.original}
        linkTo='/material/news'
        linkSearch={{ website_id: row.original.website_id }}
        countKey='material_news_count'
        icon={materialDictionary.news.icon}
        className={materialDictionary.news.className}
      />
    ),
    size: 60,
  },
  /**
   * 笔料数量列 - 显示网站下笔料数量
   */
  {
    id: 'material_note_count',
    accessorKey: 'material_note_count',
    header: '笔料',
    cell: ({ row }) => (
      <EntityMaterialCountCell
        entity={row.original}
        linkTo='/material/note'
        linkSearch={{ website_id: row.original.website_id }}
        countKey='material_note_count'
        icon={materialDictionary.note.icon}
        className={materialDictionary.note.className}
      />
    ),
    size: 60,
  },

  /**
   * 文料数量列 - 显示网站下文料数量
   */
  {
    id: 'material_article_count',
    accessorKey: 'material_article_count',
    header: '文料',
    cell: ({ row }) => (
      <EntityMaterialCountCell
        entity={row.original}
        linkTo='/material/article'
        linkSearch={{ website_id: row.original.website_id }}
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

  /**
   * 书料数量列
   */
  {
    id: 'material_book_count',
    accessorKey: 'material_book_count',
    header: '书料',
    cell: ({ row }) => (
      <EntityMaterialCountCell
        entity={row.original}
        linkTo='/material/book'
        linkSearch={{ website_id: row.original.website_id }}
        countKey='material_book_count'
        icon={materialDictionary.book.icon}
        className={materialDictionary.book.className}
      />
    ),
    size: 60,
  },

  /**
   * 标料数量列
   */
  {
    id: 'material_bid_count',
    accessorKey: 'material_bid_count',
    header: '标料',
    cell: ({ row }) => (
      <EntityMaterialCountCell
        entity={row.original}
        linkTo='/material/bid'
        linkSearch={{ website_id: row.original.website_id }}
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
        linkSearch={{ website_id: row.original.website_id }}
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
        linkSearch={{ website_id: row.original.website_id }}
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
        linkSearch={{ website_id: row.original.website_id }}
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
        linkSearch={{ website_id: row.original.website_id }}
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
        linkSearch={{ website_id: row.original.website_id }}
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
        linkSearch={{ website_id: row.original.website_id }}
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
        linkSearch={{ website_id: row.original.website_id }}
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
        linkSearch={{ website_id: row.original.website_id }}
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
        linkSearch={{ website_id: row.original.website_id }}
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
        linkSearch={{ website_id: row.original.website_id }}
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
   * 入口点URL列 - 显示入口点的访问地址
   * 如果存在URL则渲染为可点击的链接，否则显示占位符
   */
  {
    accessorKey: 'entrypoint_url',
    header: 'URL',
    cell: ({ row }) => <UrlCell url={row.getValue('entrypoint_url')} />,
    size: 320,
    maxSize: 320,
    meta: {
      className: 'border-r-1',
    },
  },

  /**
   * 网站指定入口点参数要素包列
   */
  {
    id: 'param_form_website_entrypoint',
    accessorKey: 'param_form_website_entrypoint',
    header: '网站指定入口要素包',
    cell: ({ row }) => (
      <ParamFormMiniItemCell
        entity={row.original.param_form_website_entrypoint}
        isPrimary={false}
        asLink={true}
      />
    ),
    size: 160,
  },

  /**
   * 行业指定入口点参数要素包列
   */
  {
    id: 'param_form_industry_entrypoint',
    accessorKey: 'param_form_industry_entrypoint',
    header: '行业指定入口要素包',
    cell: ({ row }) => (
      <ParamFormMiniItemCell
        entity={row.original.param_form_industry_entrypoint}
        isPrimary={false}
        asLink={true}
      />
    ),
    size: 160,
  },

  /**
   * 自用参数要素包列
   */
  {
    id: 'entrypoint_self_param_slug',
    accessorKey: 'entrypoint_self_param_slug',
    header: '入口自用要素包',
    cell: ({ row }) => (
      <ParamFormMiniItemCell
        entity={row.original.param_form_self}
        isPrimary={false}
        asLink={true}
      />
    ),
    size: 160,
  },
  /**
   * 指定预备作业参数要素包列
   */
  {
    id: 'entrypoint_prejob_param_slug',
    accessorKey: 'entrypoint_prejob_param_slug',
    header: '入口预备作业要素包',
    cell: ({ row }) => (
      <ParamFormMiniItemCell
        entity={row.original.param_form_prejob}
        isPrimary={false}
        asLink={true}
      />
    ),
    size: 160,
    meta: {
      className: 'border-r-1',
    },
  },

  /**
   * 起始时间列 - 显示入口点最近起始时间
   * 使用 SmartDatetime 组件格式化时间，并设置为上海时区
   */
  {
    accessorKey: 'begin_at',
    header: '起始时间',
    cell: ({ row }) => {
      const beginAt = row.getValue('begin_at') as string
      return beginAt ? (
        <SmartDatetime date={beginAt} timezone='Asia/Shanghai' />
      ) : (
        <span className='text-gray-400'>-</span> // 如果没有时间则显示占位符
      )
    },
  },
  /**
   * 结束时间列 - 显示入口点最近结束时间
   * 使用 SmartDatetime 组件格式化时间，并设置为上海时区
   */
  {
    accessorKey: 'end_at',
    header: '结束时间',
    cell: ({ row }) => {
      const endAt = row.getValue('end_at') as string
      return endAt ? (
        <SmartDatetime date={endAt} timezone='Asia/Shanghai' />
      ) : (
        <span className='text-gray-400'>-</span> // 如果没有时间则显示占位符
      )
    },
  },
  /**
   * 创建时间列
   */
  {
    accessorKey: 'created_at',
    header: '创建时间',
    cell: ({ row }) => <DatetimeCell value={row.getValue('created_at')} />,
    meta: {
      className: 'text-center',
    },
  },
  /**
   * 更新时间列
   */
  {
    accessorKey: 'updated_at',
    header: '更新时间',
    cell: ({ row }) => <DatetimeCell value={row.getValue('updated_at')} />,
  },

  /**
   * 自身状态列 - 2x2 四方格显示可用/锁定/运转/受限
   */
  {
    id: 'entrypoint_status',
    header: '自身状态',
    cell: ({ row }) => (
      <EntitySelfStatusCell entity_type='entrypoint' entity={row.original} />
    ),
    size: 50,
  },

  /**
   * 入口点启用状态列 - 控制入口点的启用/禁用状态
   * 包含一个开关组件，点击可切换状态并发送API请求
   * 支持过滤功能，可筛选启用/禁用的入口点
   */
  {
    id: 'entrypoint_enabled',
    accessorKey: 'entrypoint_enabled',
    header: '开关',
    cell: ({ row }) => <EntrypointEnabledSwitch entrypoint={row.original} />,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id)) // 自定义过滤函数
    },
    size: 60,
    maxSize: 60,
  },
  /**
   * 操作列 - 包含行级别的操作按钮
   * 如编辑、删除等操作
   */
  {
    id: 'actions',
    enableHiding: false,
    header: '操作',
    cell: ({ row }) => <EntrypointsRowActions row={row} />,
    size: 54,
    maxSize: 54,
  },
]
