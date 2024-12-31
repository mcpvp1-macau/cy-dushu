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

  const { t } = useTranslation()

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
                label: t('common.download'),
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
                    title={t('wayline.deleteWayline.title')}
                    description={t('wayline.deleteWayline.description')}
                    onConfirm={handleDel}
                  >
                    {t('common.delete')}
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
      <p className="text-xs mt-1">
        {t('wayline.regenerator.title')}: {data.gmtModifiedBy}
      </p>
      <p className="text-xs mt-1">
        {t('common.updateTime')}: {data.gmtModified}
      </p>
    </li>
  )
})

AirlineTemplateListItem.displayName = 'AirlineTemplateListItem'

export default AirlineTemplateListItem
