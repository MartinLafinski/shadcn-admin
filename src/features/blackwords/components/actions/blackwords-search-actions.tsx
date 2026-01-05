// 引入依赖
import { useState } from 'react'
// 样式
import { cn } from '@/lib/utils.ts'
// 图标
import { SearchIcon, XIcon, ChevronDownIcon } from 'lucide-react'
// 按钮控件
import { Button } from '@/components/ui/button.tsx'
// 下拉菜单控件
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx"
// 输入框组控件
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group.tsx"
// 按钮组控件
import {
  ButtonGroup,
} from "@/components/ui/button-group.tsx"
// 可用性标签
import { enableLabels } from "../../data/labels.tsx"
// 获取敏感词数据
import { useBlackwords } from '../blackwords-provider.tsx'

/**
 * 敏感词搜索组件
 * 提供敏感词名称/标识的关键词搜索和状态筛选功能
 * 
 * 组件功能：
 * 1. 支持关键词搜索（敏感词名称/标识）
 * 2. 支持状态筛选（启用/禁用/全部）
 * 3. 提供重置功能
 * 
 * 使用说明：
 * - 组件会自动调用 useBlackwords 的 setSearchParams 方法更新搜索参数
 * - 搜索参数包括：blackwords_keyword（关键词）和 blackwords_enabled（状态）
 */
type SearchProps = {
  className?: string
  type?: React.HTMLInputTypeAttribute
  placeholder?: string
}

export function Search({
                         className = ''
                       }: SearchProps) {
  const { searchParams, setSearchParams } = useBlackwords()

  // 本地状态：输入框的关键词
  const [keyword, setKeyword] = useState<string>('')
  // 本地状态：选中的可用性标签（显示在下拉按钮上）
  const [selectedLabel, setSelectedLabel] = useState<string>('状态')
  // 本地状态：实际的可用性值（用于API参数）
  const [enabledValue, setEnabledValue] = useState<boolean | undefined>(undefined)

  /**
   * 处理搜索按钮点击事件
   * 将当前关键词和状态值提交到搜索参数中
   * 如果关键词为空，则不传递该参数
   */
  const handleSearch = () => {
    // 更新搜索参数，触发 API 重新请求
    setSearchParams({
      blackwords_keyword: keyword || undefined, // 如果关键词为空，设置为 undefined（不传递参数）
      blackwords_enabled: enabledValue, // 传递选中的状态值（true/false/undefined）
      page: 1,
      size: searchParams.size,
    })
  }

  /**
   * 处理重置按钮点击事件
   * 重置所有本地状态和搜索参数
   * 重置后会触发默认的数据请求（无过滤条件）
   */
  const handleReset = () => {
    setKeyword('') // 清空关键词
    setSelectedLabel('状态') // 重置标签显示为"状态"
    setEnabledValue(undefined) // 重置状态值为 undefined（不过滤状态）
    setSearchParams({
      blackwords_keyword: undefined, // 如果关键词为空，设置为 undefined（不传递参数）
      blackwords_enabled: undefined, // 传递选中的状态值（true/false/undefined）
      page: 1,
      size: searchParams.size,
    }) // 清空所有搜索参数，触发默认请求
  }

  return (
    <div className={cn("flex w-full max-w-sm gap-4", className)}>
      {/* 搜索输入框组合，包含关键词输入和状态筛选下拉菜单 */}
      <ButtonGroup>
        <InputGroup className="[--radius:1rem]">
          {/* 关键词输入框 - 支持输入敏感词名称、标识进行搜索 */}
          <InputGroupInput
            placeholder="敏感词名称/标识"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)} // 更新关键词状态
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch()
              }
            }}
          />
          
          {/* 状态筛选下拉菜单 - 用于筛选敏感词的启用状态 */}
          <InputGroupAddon align="inline-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                {/* 下拉触发按钮 - 显示当前选中的状态标签 */}
                <InputGroupButton variant="ghost" className="!pr-1.5 text-xs">
                  {selectedLabel} <ChevronDownIcon className="size-3" />
                </InputGroupButton>
              </DropdownMenuTrigger>
              
              {/* 下拉菜单内容 - 包含所有可选状态项 */}
              <DropdownMenuContent align="end" className="[--radius:0.95rem]">
                {/* "所有"选项 - 清除状态筛选条件 */}
                <DropdownMenuItem 
                  onClick={() => {
                    setSelectedLabel('所有')
                    setEnabledValue(undefined)
                  }}
                >
                  所有
                </DropdownMenuItem>
                
                {/* 遍历 enableLabels 数组，生成每个状态选项 */}
                {enableLabels.map((item) => (
                  <DropdownMenuItem
                    key={item.value.toString()} // 使用值的字符串作为唯一键
                    onClick={() => {
                      // 更新显示标签和实际状态值
                      setSelectedLabel(`${item.label}`)
                      setEnabledValue(item.value as boolean)
                    }}
                  >
                    {item.label} {/* 显示状态标签 */}
                    <item.icon/> {/* 显示状态图标 */}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </InputGroupAddon>
        </InputGroup>
        
        {/* 搜索按钮 - 触发搜索操作 */}
        <Button onClick={handleSearch}>
          <SearchIcon/>
          查找
        </Button>
      </ButtonGroup>
      
      {/* 重置按钮 - 清空所有搜索条件 */}
      <Button variant='outline' onClick={handleReset}>
        <XIcon/>
        重置
      </Button>
    </div>
  )
}