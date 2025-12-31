import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useBlackwords } from '../blackwords-provider'
import { Cross2Icon, MagnifyingGlassIcon } from '@radix-ui/react-icons'

export function Search() {
  const { searchParams, setSearchParams } = useBlackwords()

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams({ 
      blackwords_keyword: e.target.value || undefined,
      page: 1  // 搜索时重置到第一页
    })
  }

  const handleStatusChange = (enabled: boolean | undefined) => {
    setSearchParams({ 
      blackwords_enabled: enabled,
      page: 1  // 筛选时重置到第一页
    })
  }

  const clearFilters = () => {
    setSearchParams({ 
      blackwords_keyword: undefined,
      blackwords_enabled: undefined,
      page: 1
    })
  }

  return (
    <div className="relative flex-1">
      <MagnifyingGlassIcon className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="搜索敏感词..."
        className="h-8 w-full appearance-none bg-background pl-8 shadow-none"
        value={searchParams.blackwords_keyword || ''}
        onChange={handleKeywordChange}
      />
      {(searchParams.blackwords_keyword || searchParams.blackwords_enabled !== undefined) && (
        <Button
          variant="outline"
          size="sm"
          className="absolute right-0.5 top-0.5 h-7 rounded-l-none px-2.5"
          onClick={clearFilters}
        >
          <Cross2Icon className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  )
}