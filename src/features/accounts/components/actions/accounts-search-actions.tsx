import { useEffect, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { SearchIcon, XIcon } from 'lucide-react'
import { cn } from '@/lib/utils.ts'
import { Badge } from '@/components/ui/badge'
import { ButtonGroup } from '@/components/ui/button-group.tsx'
import { Button } from '@/components/ui/button.tsx'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group.tsx'
import { useAccounts } from '../accounts-provider.tsx'

const route = getRouteApi('/_authenticated/accounts/')
const DEFAULT_PAGE_SIZE: number = Number(
  import.meta.env.VITE_ACCOUNT_PAGE_SIZE || 50
)

type SearchProps = {
  className?: string
}

export function Search({ className = '' }: SearchProps) {
  const { searchParams, setSearchParams } = useAccounts()
  const navigate = route.useNavigate()

  const [keyword, setKeyword] = useState<string>('')

  const [isActive, setIsActive] = useState<boolean | undefined>(
    searchParams?.is_active
  )
  const [isSuperuser, setIsSuperuser] = useState<boolean | undefined>(
    searchParams?.is_superuser
  )
  const [isVerified, setIsVerified] = useState<boolean | undefined>(
    searchParams?.is_verified
  )

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setKeyword(searchParams?.keyword ?? '')
    setIsActive(searchParams?.is_active)
    setIsSuperuser(searchParams?.is_superuser)
    setIsVerified(searchParams?.is_verified)
  }, [
    searchParams.keyword,
    searchParams.is_active,
    searchParams.is_superuser,
    searchParams.is_verified,
  ])

  const updateUrlParams = (params: {
    keyword?: string
    is_active?: boolean
    is_superuser?: boolean
    is_verified?: boolean
    page?: number
    size?: number
  }) => {
    navigate({
      search: (prev) => {
        const newParams: Record<string, unknown> = {
          ...(prev as Record<string, unknown>),
        }

        if (params.keyword !== undefined) {
          newParams.keyword = params.keyword || undefined
        }
        if (params.is_active !== undefined) {
          newParams.is_active =
            params.is_active === undefined ? undefined : params.is_active
        }
        if (params.is_superuser !== undefined) {
          newParams.is_superuser =
            params.is_superuser === undefined ? undefined : params.is_superuser
        }
        if (params.is_verified !== undefined) {
          newParams.is_verified =
            params.is_verified === undefined ? undefined : params.is_verified
        }
        if (params.page !== undefined && params.page > 1) {
          newParams.page = params.page
        } else if (params.page !== undefined) {
          delete newParams.page
        }
        if (params.size !== undefined && params.size !== DEFAULT_PAGE_SIZE) {
          newParams.size = params.size
        } else if (params.size !== undefined) {
          delete newParams.size
        }

        Object.keys(newParams).forEach((key) => {
          if (newParams[key] === undefined) {
            delete newParams[key]
          }
        })

        return newParams
      },
    })
  }

  const handleSearch = () => {
    const newParams = {
      keyword: keyword || undefined,
      is_active: isActive,
      is_superuser: isSuperuser,
      is_verified: isVerified,
      page: 1,
      size: searchParams.size,
    }

    setSearchParams(newParams)
    updateUrlParams(newParams)
  }

  const handleReset = () => {
    setKeyword('')
    setIsActive(undefined)
    setIsSuperuser(undefined)
    setIsVerified(undefined)

    const resetParams = {
      keyword: undefined,
      is_active: undefined,
      is_superuser: undefined,
      is_verified: undefined,
      page: 1,
      size: searchParams.size,
    }

    setSearchParams(resetParams)
    updateUrlParams(resetParams)
  }

  const activeFilterCount = [
    isActive !== undefined,
    isSuperuser !== undefined,
    isVerified !== undefined,
  ].filter(Boolean).length

  return (
    <div className={cn('xs:max-w-xs flex w-full max-w-sm gap-4', className)}>
      <ButtonGroup>
        <InputGroup className='[--radius:1rem]'>
          <InputGroupAddon align='inline-start'>
            <InputGroupButton size='icon-xs' onClick={handleReset}>
              <XIcon />
            </InputGroupButton>
          </InputGroupAddon>
          <InputGroupInput
            placeholder='用户名/邮箱'
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch()
              }
            }}
          />
        </InputGroup>
        <Button onClick={handleSearch}>
          <SearchIcon />
          <span className='hidden sm:inline'>查找</span>
        </Button>
      </ButtonGroup>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='outline' size='sm' className='h-9 gap-1'>
            筛选
            {activeFilterCount > 0 && (
              <Badge variant='secondary' className='ml-1 h-5 px-1 text-xs'>
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='start' className='w-48'>
          <DropdownMenuLabel>用户状态</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={isActive === true}
            onCheckedChange={() => {
              const next = isActive === true ? undefined : true
              setIsActive(next)
            }}
          >
            启用
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={isActive === false}
            onCheckedChange={() => {
              const next = isActive === false ? undefined : false
              setIsActive(next)
            }}
          >
            禁用
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>角色</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={isSuperuser === true}
            onCheckedChange={() => {
              const next = isSuperuser === true ? undefined : true
              setIsSuperuser(next)
            }}
          >
            管理员
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={isSuperuser === false}
            onCheckedChange={() => {
              const next = isSuperuser === false ? undefined : false
              setIsSuperuser(next)
            }}
          >
            普通用户
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>验证状态</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={isVerified === true}
            onCheckedChange={() => {
              const next = isVerified === true ? undefined : true
              setIsVerified(next)
            }}
          >
            已验证
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={isVerified === false}
            onCheckedChange={() => {
              const next = isVerified === false ? undefined : false
              setIsVerified(next)
            }}
          >
            未验证
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
