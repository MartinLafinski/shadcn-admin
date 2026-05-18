import { type ColumnDef } from '@tanstack/react-table'
import { EyeIcon } from 'lucide-react'
import { Button } from '@/components/ui/button.tsx'
import { EntityBooleanCell } from '@/components/smart/cells/entity-boolean-cell'
import { EntityIdCell } from '@/components/smart/cells/entity-id-cell'
import { EntitySelectCell } from '@/components/smart/cells/entity-select-cell'
import { EntitySelectHeader } from '@/components/smart/cells/entity-select-header'
import {
  activeLabels,
  superuserLabels,
  verifiedLabels,
} from '@/features/accounts/data/labels'
import { type AccountData } from '@/features/accounts/data/schemas'
import { useAccounts } from './accounts-provider'
import { AccountsRowActions } from './actions/accounts-row-actions'

// eslint-disable-next-line react-refresh/only-export-components
function AccountsViewCell({ account }: { account: AccountData }) {
  const { setOpen, setCurrentRow } = useAccounts()
  return (
    <div className='text-left'>
      <Button
        variant='ghost'
        size='icon'
        onClick={() => {
          setCurrentRow(account)
          setOpen('view')
        }}
      >
        <EyeIcon className='h-4 w-4' />
      </Button>
    </div>
  )
}

export const accountsColumns: ColumnDef<AccountData>[] = [
  {
    id: 'select',
    header: ({ table }) => <EntitySelectHeader table={table} />,
    cell: ({ row }) => <EntitySelectCell row={row} />,
    enableSorting: false,
    enableHiding: false,
    size: 40,
  },
  {
    id: 'user_id',
    accessorKey: 'user_id',
    header: 'ID',
    cell: ({ row }) => <EntityIdCell value={row.getValue('user_id')} />,
    size: 60,
  },
  {
    id: 'username',
    accessorKey: 'username',
    header: '用户名',
    cell: ({ row }) => (
      <span className='font-medium'>{row.getValue('username')}</span>
    ),
  },
  {
    id: 'email',
    accessorKey: 'email',
    header: '邮箱',
    cell: ({ row }) => (
      <span className='text-sm text-muted-foreground'>
        {row.getValue('email')}
      </span>
    ),
  },
  {
    id: 'is_active',
    accessorKey: 'is_active',
    header: '状态',
    cell: ({ row }) => {
      const value = row.getValue('is_active') as boolean
      const labels = value ? activeLabels.true : activeLabels.false
      return (
        <EntityBooleanCell
          value={value}
          trueIcon={labels.icon}
          falseIcon={activeLabels.false.icon}
          trueLabel={labels.label}
          falseLabel={activeLabels.false.label}
          trueClassName={activeLabels.true.className}
          falseClassName={activeLabels.false.className}
        />
      )
    },
    size: 100,
  },
  {
    id: 'is_superuser',
    accessorKey: 'is_superuser',
    header: '角色',
    cell: ({ row }) => {
      const value = row.getValue('is_superuser') as boolean
      const labels = value ? superuserLabels.true : superuserLabels.false
      return (
        <EntityBooleanCell
          value={value}
          trueIcon={labels.icon}
          falseIcon={superuserLabels.false.icon}
          trueLabel={labels.label}
          falseLabel={superuserLabels.false.label}
          trueClassName={superuserLabels.true.className}
          falseClassName={superuserLabels.false.className}
        />
      )
    },
    size: 110,
  },
  {
    id: 'is_verified',
    accessorKey: 'is_verified',
    header: '验证',
    cell: ({ row }) => {
      const value = row.getValue('is_verified') as boolean
      const labels = value ? verifiedLabels.true : verifiedLabels.false
      return (
        <EntityBooleanCell
          value={value}
          trueIcon={labels.icon}
          falseIcon={verifiedLabels.false.icon}
          trueLabel={labels.label}
          falseLabel={verifiedLabels.false.label}
          trueClassName={verifiedLabels.true.className}
          falseClassName={verifiedLabels.false.className}
        />
      )
    },
    size: 110,
  },
  {
    id: 'view',
    enableHiding: false,
    header: '查看',
    cell: ({ row }) => <AccountsViewCell account={row.original} />,
    size: 80,
  },
  {
    id: 'actions',
    enableHiding: false,
    header: '操作',
    cell: ({ row }) => <AccountsRowActions row={row} />,
    size: 54,
    maxSize: 54,
  },
]
