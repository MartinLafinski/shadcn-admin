import { Badge } from '@/components/ui/badge'

/**
 * SmartDatetime 组件接口定义
 *
 * 该组件用于显示格式化的日期时间信息，支持时区转换和格式化显示
 */
interface SmartDatetimeProps {
  /**
   * 日期时间值，支持字符串或 Date 对象
   * 字符串格式通常应为 ISO 8601 格式 (如: '2023-01-01T12:00:00Z')
   */
  date: string | Date

  /**
   * 显示时区，默认为 'UTC'
   * 例如: 'UTC', 'Asia/Shanghai', 'America/New_York'
   */
  timezone?: string
}

/**
 * SmartDatetime 组件 - 智能日期时间显示组件
 *
 * 该组件的主要功能：
 * 1. 将传入的日期时间值转换为指定时区的格式化显示
 * 2. 提供日期和时间的分段显示（日期为黑色，时间为绿色）
 * 3. 显示时区缩写
 * 4. 错误处理：无效日期或格式化失败时显示错误提示
 *
 * 使用场景：
 * - 需要显示带时区信息的日期时间
 * - 需要统一日期时间显示格式
 * - 需要支持多时区显示
 *
 * 注意事项：
 * - 组件会将日期格式转换为 YYYY-MM-DD HH:mm:ss 格式
 * - 日期部分显示为黑色，时间部分显示为绿色，便于区分
 * - 如果 date 为空，组件将返回 null（不渲染任何内容）
 *
 * @param {SmartDatetimeProps} props - 组件属性
 * @returns {JSX.Element | null} 格式化后的日期时间显示组件，或错误提示
 */
export function SmartDatetime({ date, timezone = 'UTC' }: SmartDatetimeProps) {
  // 如果日期为空，不渲染任何内容
  if (!date) return null

  try {
    // 将输入的日期转换为 Date 对象
    // 如果输入是字符串，则创建新的 Date 对象；如果已经是 Date 对象，则直接使用
    const d = typeof date === 'string' ? new Date(date) : date

    // 检查日期是否有效
    // 通过检查 getTime() 返回值是否为 NaN 来判断日期是否有效
    if (isNaN(d.getTime())) {
      return <span className='text-xs text-destructive'>Invalid Date</span>
    }

    // 使用 Intl.DateTimeFormat API 来格式化日期时间
    // 选择 'en-GB' locale 是为了确保能正确提取日期时间的各个部分
    // 该 API 支持时区转换和多语言格式化
    const formatter = new Intl.DateTimeFormat('en-GB', {
      year: 'numeric', // 年份，如 2023
      month: '2-digit', // 月份，如 01-12
      day: '2-digit', // 日期，如 01-31
      hour: '2-digit', // 小时，如 00-23
      minute: '2-digit', // 分钟，如 00-59
      second: '2-digit', // 秒，如 00-59
      hour12: false, // 使用 24 小时制
      timeZone: timezone, // 指定时区
      timeZoneName: 'short', // 显示时区缩写
    })

    // 获取格式化后的各个部分
    // formatToParts 方法返回一个包含各个日期时间组件的对象数组
    const parts = formatter.formatToParts(d)

    // 辅助函数：从格式化后的部分中提取特定类型的数据
    const getPart = (type: string) =>
      parts.find((p) => p.type === type)?.value || ''

    // 提取并重新格式化日期部分
    // 原始格式为 DD/MM/YYYY，转换为 YYYY-MM-DD 格式
    const dateStr = `${getPart('year')}-${getPart('month')}-${getPart('day')}`

    // 提取时间部分，格式为 HH:mm:ss
    const timeStr = `${getPart('hour')}:${getPart('minute')}:${getPart('second')}`

    // 提取时区名称缩写，如 GMT、CST 等
    const tzStr = getPart('timeZoneName')

    // 渲染日期时间显示组件
    // 使用 Badge 组件显示日期时间，其中日期为黑色，时间为绿色
    // 时区信息单独显示，便于用户识别时间所属时区
    return (
      <div className='flex flex-wrap items-center justify-center gap-0.5'>
        {/* 日期时间主要显示区域 - 使用 outline 变体，日期黑色，时间绿色 */}
        <Badge
          variant='outline'
          className='px-1.5 font-mono text-sm font-normal'
        >
          <span className='text-xs text-foreground dark:text-zinc-100'>
            {dateStr}
          </span>
          <span className='text-xs text-green-700 dark:text-green-500'>
            {timeStr}
          </span>
        </Badge>

        {/* 时区缩写显示 */}
        <span className='text-[10px] text-muted-foreground'>{tzStr}</span>
      </div>
    )
  } catch (error) {
    // 捕获日期格式化过程中可能出现的错误
    // 记录错误信息到控制台，便于调试
    console.error('Failed to format date:', error)
    // 显示错误提示，使用红色文字突出显示
    return <span className='text-xs text-destructive'>Error</span>
  }
}
