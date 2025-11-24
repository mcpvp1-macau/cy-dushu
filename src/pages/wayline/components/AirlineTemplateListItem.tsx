import IconEdit2 from '@/assets/icons/jsx/IconEdit2'
import IconMore from '@/assets/icons/jsx/IconMore'
import IconPointClout3DWayline from '@/assets/icons/jsx/IconPointCloud3DWayline'
import IconPreview from '@/assets/icons/jsx/IconPreview'
import IconRebotDogWayline from '@/assets/icons/jsx/IconRebotDogWayline'
import IconSwarm from '@/assets/icons/jsx/IconSwarm'
import IconWaylineAirpoint from '@/assets/icons/jsx/IconWaylineAirpoint'
import MenuIconAirline from '@/assets/icons/jsx/menus/MenuIconAirline'
import IconButton from '@/components/ui/button/IconButton'
import OverflowText from '@/components/ui/OverflowText'
import { WaylineEnum } from '@/constant/uav/wayline'
import { delAirlineTempalte } from '@/service/modules/airline'
import useWaylinesStore from '@/store/map/useWaylines.store'
import { downloadAndRename } from '@/utils/download'
import { shouldJson } from '@/utils/json'
import { QuestionCircleFilled } from '@ant-design/icons'
import { Dropdown, Popconfirm } from 'antd'
import { ReactNode } from 'react'
import { Link } from 'react-router-dom'

type PropsType = {
  data: API_AIRLINE.domain.AIRLINE_TEMPLATE
}

const AirlineTemplateListItem: FC<PropsType> = memo(({ data }) => {
  const queryClient = useQueryClient()
  const handleDel = async () => {
    await delAirlineTempalte(data.waylineTemplateId)
    queryClient.invalidateQueries({ queryKey: ['airlineTemplates'] })
    // 如果正在预览该航线模板，取消预览
    const store = useWaylinesStore.getState()
    if (store.previewedWayline?.id === data.templateId) {
      store.setPreviewedWayline(null)
    }
  }

  const { t } = useTranslation()

  return (
    <li className="card-border text-sm p-2 bg-ground-2">
      <div className="flex gap-2">
        <WaylineIcon type={data.taskType} />
        <div className="grow">
          <OverflowText className="text-hightlight max-w-52 truncate">
            {data.taskName}
          </OverflowText>
        </div>
        <IconButton
          tippyProps={{ content: t('common.preview') }}
          disabled={
            data.taskType === WaylineEnum.SwarmWayline ||
            data.taskType === WaylineEnum.PointCloud3DWayline
          }
          onClick={() => {
            const positions = shouldJson(data.parameters)?.spaces?.[0]
              ?.positions
            if (!positions) {
              return
            }
            useWaylinesStore.getState().setPreviewedWayline({
              id: data.templateId,
              type: data.taskType,
              points: positions,
              taskBasic: shouldJson(data.taskBasic) ?? {},
            })
          }}
        >
          <IconPreview />
        </IconButton>
        <Link
          to={`${getWaylineEditURL(data.taskType)}/${data.waylineTemplateId}`}
        >
          <IconButton
            className="text-xs"
            tippyProps={{ content: t('common.edit') }}
          >
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

export const WaylineIcon: FC<{ type: string }> = ({ type }) => {
  return (
    (
      {
        waypoint: <IconWaylineAirpoint />,
        fixed_point_cruise: <IconRebotDogWayline />,
        area_waypoint: <MenuIconAirline />,
        cluster_wayline: <IconSwarm />,
        mapping2d: <IconWaylineAirpoint />,
        mapping3d: <IconWaylineAirpoint />,
        point_cloud_3d: <IconPointClout3DWayline />,
      } as Record<string, ReactNode>
    )[type] || <QuestionCircleFilled />
  )
}

export const getWaylineEditURL = (type: string) => {
  return (
    {
      waypoint: '/wayline/edit',
      fixed_point_cruise: '/wayline/rebot-dog-wayline-edit',
      area_waypoint: '/wayline/area-wayline-edit',
      cluster_wayline: '/wayline/swarm-wayline-edit',
      mapping2d: '/wayline/edit',
      mapping3d: '/wayline/edit',
      point_cloud_3d: '/wayline/point-cloud-3d-edit',
    }[type] || '/404'
  )
}
