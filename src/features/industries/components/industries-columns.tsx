// 图标
// 表格列
import { type ColumnDef } from '@tanstack/react-table'
import { MapPinIcon, ListTodoIcon, PawPrintIcon } from 'lucide-react'
// 采料类型字典
import { materialDictionary } from '@/lib/labels'
// 自定义时间控件
import { DatetimeCell } from '@/components/smart/cells/datetime-cell'
// 实体ID单元格
import { EntityIdCell } from '@/components/smart/cells/entity-id-cell'
// 条目信息单元格
import { EntityItemCountCell } from '@/components/smart/cells/entity-items-count-cell'
// 行业 Material 统计单元格
import { EntityMaterialCountCell } from '@/components/smart/cells/entity-material-count-cell'
// 实体选择单元格
import { EntitySelectCell } from '@/components/smart/cells/entity-select-cell'
// 实体选择表头
import { EntitySelectHeader } from '@/components/smart/cells/entity-select-header'
// 行业爬虫任务进度条单元格
import { EntitySpiderTaskBarCell } from '@/components/smart/cells/entity-spider-task-bar-cell'
// 行业迷你信息单元格
import { EntitySpiderTaskBarHeader } from '@/components/smart/cells/entity-spider-task-bar-header'
// 行业单元格
import { IndustryMiniItemCell } from '@/components/smart/cells/industry-mini-item-cell'
// 参数要素单元格
import { ParamFormMiniItemCell } from '@/components/smart/cells/param-form-mini-item-cell'
// 行业数据结构
import { type IndustryData } from '@/features/industries/data/schemas'
// 自定义行操作控件
import { IndustriesRowActions } from './actions/industries-row-actions'
// 行业状态
import { useIndustries } from './industries-provider'

/**
 * 行业列表表格列定义
 *
 * 定义了行业管理页面表格的所有列，包括：
 * - 选择列：支持全选和单选
 * - 基础信息列：ID、名称、标识
 * - 时间列：创建时间和更新时间
 * - 查看列：查看行业详细信息
 * - 配置说明列：提供查看行业配置和说明的入口
 * - 操作列：编辑、删除等操作
 *
 * 使用 TanStack Table 的 ColumnDef 类型定义
 */
export const industriesColumns: ColumnDef<IndustryData>[] = [
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
   * 行业ID列 - 显示行业的唯一标识符
   * 居中显示，便于快速识别
   */
  {
    id: 'industry_id',
    accessorKey: 'industry_id',
    header: 'ID',
    cell: ({ row }) => <EntityIdCell value={row.getValue('industry_id')} />,
    enableHiding: false, // ID列不允许隐藏
    size: 60,
  },

  /**
   * 行业列 - 显示行业名称
   */
  {
    id: 'industry',
    accessorKey: 'industry',
    header: '行业',
    cell: ({ row }) => {
      const industry = row.original // 获取当前行的原始数据
      const { setOpen, setCurrentRow } = useIndustries() // 使用行业上下文状态
      return (
        <IndustryMiniItemCell
          industry={row.original}
          isPrimary={true}
          onClick={() => {
            setCurrentRow(industry) // 设置当前选中的行数据
            setOpen('view') // 打开查看行业信息对话框
          }}
        />
      )
    },
    enableHiding: false, // 行业列不允许隐藏
  },

  /**
   * 入口点数量列 - 显示行业下属的入口点数量
   * 使用 EntityItemCountCell 组件渲染，可点击跳转到入口点列表
   */
  {
    id: 'entrypoint_count',
    accessorKey: 'entrypoint_count',
    header: '入口点',
    cell: ({ row }) => (
      <EntityItemCountCell
        count={row.getValue('entrypoint_count')}
        to='/entrypoints'
        searchParams={{ industry_id: row.original.industry_id }}
        icon={MapPinIcon}
        className='bg-lime-100 text-lime-900 dark:bg-lime-300/70'
      />
    ),
    size: 60,
  },
  /**
   * 预备作业数量列 - 显示行业下属的预备作业数量
   * 使用 EntityItemCountCell 组件渲染，可点击跳转到预备作业列表
   */
  {
    id: 'prejob_count',
    accessorKey: 'prejob_count',
    header: '预备作业',
    cell: ({ row }) => (
      <EntityItemCountCell
        count={row.getValue('prejob_count')}
        to='/prejobs'
        searchParams={{ industry_id: row.original.industry_id }}
        icon={ListTodoIcon}
        className='bg-green-100 text-green-900 dark:bg-green-300/70'
      />
    ),
    size: 60,
  },
  /**
   * 爬虫任务数量列 - 显示行业下属的爬虫任务数量
   * 使用 EntityItemCountCell 组件渲染，可点击跳转到爬虫任务列表
   */
  {
    id: 'spider_task_count',
    accessorKey: 'spider_task_count',
    header: '爬虫任务',
    cell: ({ row }) => (
      <EntityItemCountCell
        count={row.getValue('spider_task_count') || 10}
        to='/spider_tasks'
        searchParams={{ industry_id: row.original.industry_id }}
        icon={PawPrintIcon}
        className='bg-cyan-100 text-cyan-900 dark:bg-cyan-300/70'
      />
    ),
    size: 60,
    meta: {
      className: 'border-r-1',
    },
  },
  /**
   * 行业爬虫任务进度条列 - 显示成功/失败/中断/取消的比例
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
        linkSearch={{ industry_id: row.original.industry_id }}
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
        linkSearch={{ industry_id: row.original.industry_id }}
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
        linkSearch={{ industry_id: row.original.industry_id }}
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
        linkSearch={{ industry_id: row.original.industry_id }}
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
        linkSearch={{ industry_id: row.original.industry_id }}
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
        linkSearch={{ industry_id: row.original.industry_id }}
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
        linkSearch={{ industry_id: row.original.industry_id }}
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
        linkSearch={{ industry_id: row.original.industry_id }}
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
        linkSearch={{ industry_id: row.original.industry_id }}
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
        linkSearch={{ industry_id: row.original.industry_id }}
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
        linkSearch={{ industry_id: row.original.industry_id }}
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
        linkSearch={{ industry_id: row.original.industry_id }}
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
        linkSearch={{ industry_id: row.original.industry_id }}
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
        linkSearch={{ industry_id: row.original.industry_id }}
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
        linkSearch={{ industry_id: row.original.industry_id }}
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
        linkSearch={{ industry_id: row.original.industry_id }}
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
        linkSearch={{ industry_id: row.original.industry_id }}
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
        linkSearch={{ industry_id: row.original.industry_id }}
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
        linkSearch={{ industry_id: row.original.industry_id }}
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
        linkSearch={{ industry_id: row.original.industry_id }}
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
   * 创建时间列 - 显示行业创建时间
   * 使用 SmartDatetime 组件格式化时间，并设置为上海时区
   */
  {
    accessorKey: 'created_at',
    header: '创建时间',
    cell: ({ row }) => <DatetimeCell value={row.getValue('created_at')} />,
  },
  {
    accessorKey: 'updated_at',
    header: '更新时间',
    cell: ({ row }) => <DatetimeCell value={row.getValue('updated_at')} />,
  },

  /**
   * 操作列 - 包含行级别的操作按钮
   * 如编辑、删除等操作
   */
  {
    id: 'actions',
    enableHiding: false, // 操作列不允许隐藏
    header: '操作',
    cell: ({ row }) => <IndustriesRowActions row={row} />,
    size: 54,
    maxSize: 54,
  },
]
