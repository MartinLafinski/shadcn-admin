// 表格列
import { type ColumnDef } from '@tanstack/react-table'
// 图标
import { MapPinIcon, ListTodo, Package } from 'lucide-react'
// 采料类型字典
import { materialDictionary } from '@/lib/labels.tsx'
// 自定义时间控件
import { DatetimeCell } from '@/components/smart/cells/datetime-cell'
// 网站启用状态显示单元格
import { EntityEnabledStatusCell } from '@/components/smart/cells/entity-enabled-status-cell'
// 实体ID单元格
import { EntityIdCell } from '@/components/smart/cells/entity-id-cell'
// 网站聚合状态单元格
import { EntityInheritStatusCell } from '@/components/smart/cells/entity-inherit-status-cell'
// 条目信息单元格
import { EntityItemCountCell } from '@/components/smart/cells/entity-items-count-cell'
// 网站未限状态单元格
import { EntityLimitedCell } from '@/components/smart/cells/entity-limited-cell'
// 网站锁定状态单元格
import { EntityLockedCell } from '@/components/smart/cells/entity-locked-cell'
// 网站 Material 统计单元格
import { EntityMaterialCountCell } from '@/components/smart/cells/entity-material-count-cell'
// 网站暂停状态单元格
import { EntityPausedCell } from '@/components/smart/cells/entity-paused-cell'
// 实体选择单元格
import { EntitySelectCell } from '@/components/smart/cells/entity-select-cell'
// 实体选择表头
import { EntitySelectHeader } from '@/components/smart/cells/entity-select-header'
// 网站聚合状态单元格
import { EntitySelfStatusCell } from '@/components/smart/cells/entity-self-status-cell'
// 网站爬虫任务进度条单元格
import { EntitySpiderTaskBarCell } from '@/components/smart/cells/entity-spider-task-bar-cell'
// 网站迷你信息单元格
import { EntitySpiderTaskBarHeader } from '@/components/smart/cells/entity-spider-task-bar-header'
// 网站迷你信息单元格
import { EntitySpiderTasksPieCell } from '@/components/smart/cells/entity-spider-tasks-pie-cell'
// 参数要素单元格
import { ParamFormMiniItemCell } from '@/components/smart/cells/param-form-mini-item-cell'
// URL单元格
import { UrlCell } from '@/components/smart/cells/url-cell.tsx'
// 网站迷你信息单元格
import { WebsiteMiniItemCell } from '@/components/smart/cells/website-mini-item-cell'
import { useWebsitesActions } from '@/features/websites/components/websites-provider'
// 网站数据结构
import { type WebsiteData } from '@/features/websites/data/schemas'
// 自定义行操作控件
import { WebsitesRowActions } from './actions/websites-row-actions'
// 网站启用状态开关组件
import { WebsiteEnabledSwitch } from './cells/website-enabled-switch.tsx'

/**
 * 网站列表表格列定义
 *
 * 定义了网站管理页面表格的所有列，包括：
 * - 选择列：支持全选和单选
 * - 基础信息列：ID、名称、标识、URL
 * - 状态列：启用/禁用开关
 * - 时间列：创建时间和更新时间
 * - 操作列：配置说明查看和行操作
 *
 * 使用 TanStack Table 的 ColumnDef 类型定义
 */
export const websitesColumns: ColumnDef<WebsiteData>[] = [
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
   * 网站ID列 - 显示网站的唯一标识符
   * 居中显示，便于快速识别
   */
  {
    id: 'website_id',
    accessorKey: 'website_id',
    header: 'ID',
    cell: ({ row }) => <EntityIdCell value={row.getValue('website_id')} />,
    enableHiding: false, // ID列不允许隐藏
    size: 60,
  },
  /**
   * 网站名称列 - 显示网站的显示名称和标识
   * 使用 WebsiteMiniItemCell 组件展示头像、名称和slug
   */
  {
    id: 'website_name',
    accessorKey: 'website_name',
    header: '网站',
    cell: ({ row }) => {
      const website = row.original // 获取当前行的原始数据
      const { setOpen, setCurrentRow } = useWebsitesActions() // 使用网站上下文状态
      return (
        <WebsiteMiniItemCell
          website={website}
          isPrimary={true}
          onClick={() => {
            setCurrentRow(website) // 设置当前选中的行数据
            setOpen('view') // 打开查看网站信息对话框
          }}
        />
      )
    },
    enableHiding: false, // 网站列不允许隐藏
    size: 200,
  },
  /**
   * 迷你状态列 - 2x2 纯色块
   */
  {
    id: 'website_status_mini',
    accessorKey: 'website_status_mini',
    header: '聚合状态',
    cell: ({ row }) => <EntityInheritStatusCell entity={row.original} />,
    enableHiding: false, // 聚合状态列不允许隐藏
    size: 40,
  },

  /**
   * 入口点数量列 - 显示网站下属的入口点数量
   * 居中显示，便于快速识别
   */
  {
    id: 'entrypoint_count',
    accessorKey: 'entrypoint_count',
    header: '入口点',
    cell: ({ row }) => (
      <EntityItemCountCell
        count={row.getValue('entrypoint_count')}
        to='/entrypoints'
        searchParams={{ website_id: row.original.website_id }}
        icon={MapPinIcon}
        className='bg-lime-100 text-lime-900 dark:bg-lime-300/70'
      />
    ),
    size: 60,
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
        searchParams={{ website_id: row.original.website_id }}
        icon={ListTodo}
        className='bg-green-100 text-green-900 dark:bg-green-300/70'
      />
    ),
    size: 60,
    meta: {
      className: 'border-r-1',
    },
  },

  /**
   * 网站在线任务饼图列 - 可视化显示在线任务占比
   */
  {
    id: 'working_spider_task_pie',
    accessorKey: 'working_spider_task_pie',
    header: '在线/上限',
    cell: ({ row }) => (
      <EntitySpiderTasksPieCell
        workingSpiders={row.original.working_spider_task_count || 3}
        maxSpiders={row.original.website_max_spider_task_count || 7}
      />
    ),
    size: 60,
  },

  /**
   * 网站任务进度条列 - 显示成功/失败/中断/取消的比例
   */
  {
    id: '爬虫任务分布',
    accessorKey: '爬虫任务分布',
    // header: '总任务 - 成功 - 失败 - 中断 - 取消',
    header: () => <EntitySpiderTaskBarHeader />,
    cell: ({ row }) => <EntitySpiderTaskBarCell taskCounter={row.original} />,
    size: 150,
    meta: {
      className: 'border-r-1',
    },
  },

  /**
   * 自身状态显示列
   */
  {
    id: 'website_enabled_status',
    accessorKey: 'website_enabled_status',
    header: '可用',
    cell: ({ row }) => (
      <EntityEnabledStatusCell entity_type='website' entity={row.original} />
    ),
    size: 40,
  },
  {
    id: 'website_locked',
    accessorKey: 'website_locked',
    header: '锁定',
    cell: ({ row }) => (
      <EntityLockedCell entity_type='website' entity={row.original} />
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    size: 40,
  },
  {
    id: 'website_paused',
    accessorKey: 'website_paused',
    header: '运转',
    cell: ({ row }) => (
      <EntityPausedCell entity_type='website' entity={row.original} />
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    size: 40,
  },
  {
    id: 'website_limited',
    accessorKey: 'website_limited',
    header: '未限',
    cell: ({ row }) => (
      <EntityLimitedCell entity_type='website' entity={row.original} />
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    size: 40,
    meta: {
      className: 'border-r-1',
    },
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
   * 子料数量列 - 显示网站下子料数量
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
   * 未知采料数量列 - 显示网站下未知材料数量
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
   * 自定义采料数量列 - 显示网站下自定义材料数量
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
   * 书料数量列 - 显示网站下书料数量
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
   * 标料数量列 - 显示网站下标料数量
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

  /**
   * 贸料数量列 - 显示网站下贸料数量
   */
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

  /**
   * 产料数量列 - 显示网站下产料数量
   */
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

  /**
   * 司料数量列 - 显示网站下司料数量
   */
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

  /**
   * 店料数量列 - 显示网站下店料数量
   */
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

  /**
   * 聘料数量列 - 显示网站下聘料数量
   */
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

  /**
   * 户料数量列 - 显示网站下户料数量
   */
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

  /**
   * 图料数量列 - 显示网站下图料数量
   */
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

  /**
   * 音料数量列 - 显示网站下音料数量
   */
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

  /**
   * 影料数量列 - 显示网站下影料数量
   */
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

  /**
   * 资料数量列 - 显示网站下资料数量
   */
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
   * 网站URL列 - 显示网站的访问地址
   * 如果存在URL则渲染为可点击的链接，否则显示占位符
   */
  {
    accessorKey: 'website_url',
    header: 'URL',
    cell: ({ row }) => <UrlCell url={row.getValue('website_url')} />,
    size: 320,
    maxSize: 320,
    meta: {
      className: 'border-r-1',
    },
  },

  /**
   * 自用参数要素包列
   */
  {
    id: 'industry_self_param_slug',
    accessorKey: 'industry_self_param_slug',
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
  /**
   * 指定入口点参数要素包列
   */
  {
    id: 'industry_entrypoint_param_slug',
    accessorKey: 'industry_entrypoint_param_slug',
    header: '行业入口点要素包',
    cell: ({ row }) => (
      <ParamFormMiniItemCell
        entity={row.original.param_form_entrypoint}
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
    id: 'industry_prejob_param_slug',
    accessorKey: 'industry_prejob_param_slug',
    header: '行业预备作业要素包',
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
   * 创建时间列
   */
  {
    accessorKey: 'created_at',
    header: '创建时间',
    cell: ({ row }) => <DatetimeCell value={row.getValue('created_at')} />,
    meta: {
      className: 'border-r-1',
    },
  },

  {
    id: 'spider_package_count',
    accessorKey: 'spider_package_count',
    header: '爬虫包',
    cell: ({ row }) => (
      <EntityItemCountCell
        count={row.getValue('spider_package_count')}
        to='/spider-packages'
        searchParams={{ website_id: row.original.website_id }}
        icon={Package}
        className='bg-amber-100 text-amber-900 dark:bg-amber-300/70'
      />
    ),
    size: 60,
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
    id: 'website_status',
    accessorKey: 'website_status',
    header: '自身状态',
    cell: ({ row }) => (
      <EntitySelfStatusCell entity_type='website' entity={row.original} />
    ),
    enableHiding: false, // 自身状态列不允许隐藏
    size: 50,
  },

  /**
   * 网站启用状态列 - 控制网站的启用/禁用状态
   * 使用独立的 WebsiteEnabledSwitch 组件处理状态切换
   * 支持过滤功能，可筛选启用/禁用的网站
   *
   * 性能优化说明：
   * - 原先 useSwitchWebsiteMutation hook 在 cell 函数内调用
   * - 每行都会创建一个独立的 hook 实例，导致严重的性能问题
   * - 现在提取为独立组件，每行只有一个组件实例，符合 React Hooks 规则
   */
  {
    id: 'website_enabled',
    accessorKey: 'website_enabled',
    header: '开关',
    cell: ({ row }) => <WebsiteEnabledSwitch website={row.original} />,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id)) // 自定义过滤函数
    },
    enableHiding: false, // 开关列不允许隐藏
    size: 60,
    maxSize: 60,
  },
  /**
   * 操作列 - 包含行级别的操作按钮
   * 如编辑、删除等操作
   */
  {
    id: 'actions',
    enableHiding: false, // 操作列不允许隐藏
    header: '操作',
    cell: ({ row }) => <WebsitesRowActions row={row} />,
    size: 54,
    maxSize: 54,
  },
]
