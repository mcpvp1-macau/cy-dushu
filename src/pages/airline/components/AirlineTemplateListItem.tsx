import IconEdit2 from '@/assets/icons/jsx/IconEdit2'
import IconMore from '@/assets/icons/jsx/IconMore'
import MenuIconAirline from '@/assets/icons/jsx/menus/MenuIconAirline'
import IconButton from '@/components/ui/button/IconButton'
import { delAirlineTempalte } from '@/service/modules/airline'
import { downloadAndRename } from '@/utils/download'
import { Dropdown, Popconfirm } from 'antd'
import { Link } from 'react-router-dom'

type PropsType = {
  data: API_AIRLINE.domain.AIRLINE_TEMPLATE
}

const AirlineTemplateListItem: FC<PropsType> = memo(({ data }) => {
  const queryClient = useQueryClient()
  const handleDel = async () => {
    await delAirlineTempalte(data.waylineTemplateId)
    queryClient.invalidateQueries({ queryKey: ['airlineTemplates'] })
  }

  return (
    <li className="card-border text-sm p-2 bg-[#1C2630]">
      <div className="flex gap-2">
        <MenuIconAirline />
        <div className="grow">
          <p className="max-w-60 truncate text-white">{data.taskName}</p>
        </div>
        <Link to={`/airline/edit/${data.waylineTemplateId}`}>
          <IconButton className="text-xs">
            <IconEdit2 />
          </IconButton>
        </Link>
        <Dropdown
          menu={{
            items: [
              {
                key: 'download',
                label: '下载',
                onClick: () =>
                  downloadAndRename(
                    `/storage/${data.taskTemplateFileUrl}`,
                    `${data.taskName}.kmz`,
                  ),
              },
              {
                key: 'delete',
                label: (
                  <Popconfirm
                    title="删除航线"
                    description="删除后航线内容不可恢复，确认删除航线吗？"
                    onConfirm={handleDel}
                  >
                    删除
                  </Popconfirm>
                ),
              },
            ],
          }}
        >
          <IconButton>
            <IconMore />
          </IconButton>
        </Dropdown>
      </div>
      <p className="text-xs mt-1">更新人员: {data.gmtModifiedBy}</p>
      <p className="text-xs mt-1">更新时间: {data.gmtModified}</p>
    </li>
  )
})

AirlineTemplateListItem.displayName = 'AirlineTemplateListItem'

export default AirlineTemplateListItem
