import Select from '@/components/AntdOverride/Select'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import XTable from '@/components/ui/XTable.tsx'
import usePageSearchParams from '@/hooks/useTableSearchParams'
import { getUserList } from '@/service/modules/jingqi-user'
import { getGroupTree } from '@/service/modules/user'
import useUserStore from '@/store/useUser.store'
import { UserOutlined } from '@ant-design/icons'
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Input, Pagination } from 'antd'
import { useSearchParams } from 'react-router-dom'

type PropsType = unknown

const helper = createColumnHelper<API_JINGQI_USER.domain.UserListItem>()

const deafultData = []

const columns = [
  helper.accessor('name', {
    header: '账户名',
    cell: (v) => (
      <div className="flex gap-2">
        <UserOutlined className="text-primary" />
        <span>{v.getValue()}</span>
      </div>
    ),
  }),
  helper.accessor('phone', { header: '手机号' }),
  helper.accessor('groupName', { header: '归属组织' }),
  helper.accessor('username', { header: '用户名' }),
  helper.accessor('bindDeviceList', { header: '绑定设备' }),
  helper.accessor('remark', { header: '备注' }),
]

/** 组织页面 */
const PageOrganization: FC<PropsType> = memo(() => {
  const [searchParams] = useSearchParams()

  const username = searchParams.get('kw') || undefined
  const page = Number(searchParams.get('page') ?? 1)
  const size = Number(searchParams.get('size') ?? 30)

  const queryClient = useQueryClient()
  let groupId = useUserStore((s) => s.user!.groupId)
  if (searchParams.get('groupId')) {
    groupId = searchParams.get('groupId')!
  }

  const { data, isLoading, isRefetching } = useQuery(
    {
      queryKey: ['bind/user/list', { groupId, page, size, username }],
      queryFn: () =>
        getUserList({
          groupList: [groupId],
          isPage: true,
          page,
          size,
          username,
        }),
      select: (d) => d.data,
    },
    queryClient,
  )

  const { data: groupTree } = useQuery({
    queryKey: ['getGroupTree'],
    queryFn: () => getGroupTree('90001'),
    select: (d) => d.data.rows,
  })

  const groupOptions = useMemo(() => {
    if (!groupTree) return []
    return groupTree.map((e) => ({
      label: e.groupName,
      value: e.groupId,
    }))
  }, [groupTree])

  const table = useReactTable({
    columns,
    data: data?.rows || deafultData,
    getCoreRowModel: getCoreRowModel(),
  })

  const { handleValueChange, handlePaginationChange } = usePageSearchParams()

  return (
    <div className="page-full p-3 bg-ground-2 flex flex-col overflow-y-hidden">
      <h2 className="text-white">组织</h2>
      <section className="mt-3 flex gap-2">
        <Input.Search
          className="w-56"
          placeholder="姓名"
          defaultValue={searchParams.get('kw') ?? undefined}
          onSearch={(v) => handleValueChange('kw', v)}
        />
        <Select
          className="w-56"
          allowClear
          placeholder="组织"
          options={groupOptions}
          value={searchParams.get('groupId')}
          onChange={(v: string) => handleValueChange('groupId', v)}
        />
      </section>
      <section className="mt-3 grow flex flex-col overflow-hidden">
        <div className="flex-1 border border-solid border-ground-1 rounded-[3px] overflow-hidden">
          <ScrollArea className="size-full x-table">
            <XTable table={table} loading={isLoading || isRefetching} />
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
        <div className="flex justify-end">
          <Pagination
            className="mt-2"
            current={page}
            pageSize={size}
            total={data?.total ?? 0}
            onChange={handlePaginationChange}
          />
        </div>
      </section>
    </div>
  )
})

PageOrganization.displayName = 'PageOrganization'

export default PageOrganization
