import { FC } from 'react'
import { useRebotDogControlRoomStore } from '@/store/context-store/useRebotDogControlRoom.store'

import { getSpaceList } from '@/service/modules/layer_overlay'

import MapSpaceConfig from '@/map/LayerConfig/components/MapSpace/MapSpaceConfig'

const PointCloudMapManager: FC = () => {
  const activeMapUrl = useRebotDogControlRoomStore((s) => s.activeMapUrl)
  const updateActiveMapUrl = useRebotDogControlRoomStore(
    (s) => s.updateActiveMapUrl,
  )

  const queryClient = useQueryClient()
  const { data = [], isLoading: _isLoading } = useQuery(
    {
      queryKey: ['getSpaceListPOINT_CLOUD_3D'],
      queryFn: () => getSpaceList({ spaceType: 'POINT_CLOUD_3D' }),
      select: (d) =>
        d.data.rows?.map((item: any) => ({
          ...item,
          spaceConfig: JSON.parse(item.spaceConfig),
        })),
    },
    queryClient,
  )

  return (
    <div className="h-full w-full p-3 flex flex-col gap-2 overflow-y-auto">
      {data.map((item: any) => (
        <MapSpaceConfig
          key={item.id}
          data={item}
          checked={activeMapUrl === item.spaceMapUrl}
          onChange={(checked) => {
            updateActiveMapUrl(checked ? item.spaceMapUrl : '')
          }}
        />
      ))}
    </div>
  )
}

export default PointCloudMapManager
