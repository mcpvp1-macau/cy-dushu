import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { getUavFlyPlans } from '@/service/modules/diting-mcp'
import { useSearchParams } from 'react-router-dom'
import { PointPrimitive, useCesium } from 'resium'
import GroundPolygon from '@/map/CesiumMap/components/service/common/GroundPolygon'
import OverlayCircle from '@/map/CesiumMap/components/service/Overlaies/OverlayCircle'
import { useAppMsg } from '@/hooks/useAppMsg'
import useMapDevicesStore from '@/store/map/useMapDevices.store'

type PropsType = unknown

const TanqiFlyPlan: FC<PropsType> = memo(() => {
  const [searchParams] = useSearchParams()
  const chatId = Number(searchParams.get('chat') ?? '0')
  const queryClient = useQueryClient()
  const _sn = useDeviceDetailStore((s) => s.deviceDetail?.properties.sn)
  const parentId = useDeviceDetailStore((s) => s.deviceDetail?.parentId)
  const parentSn = useMapDevicesStore((s) => s.deviceMap[parentId || 'never'])
    .properties.sn

  const sn = parentSn || _sn

  const { data: resp } = useQuery(
    {
      queryKey: ['tanqiFlyPlan', chatId],
      enabled: !!chatId && !!sn,
      queryFn: () => getUavFlyPlans(sn!),
    },
    queryClient,
  )

  const data = resp?.data
  const msgApi = useAppMsg()
  useEffect(() => {
    if (!resp) {
      return
    }
    if (!resp.success && resp.message !== '指定资源不存在' && resp.message) {
      msgApi.error(resp.message)
    }
  }, [resp])

  const { viewer } = useCesium()

  if (!data || !viewer) {
    return null
  }

  if (data.type === 'Polygon' && data.shape) {
    return <GroundPolygon positions={data.shape.map((e) => [e.lng, e.lat])} />
  }

  if (data.type === 'Rectangle' && data.northeast && data.southwest) {
    return (
      <GroundPolygon
        positions={[
          [data.northeast.lng, data.northeast.lat],
          [data.southwest.lng, data.northeast.lat],
          [data.southwest.lng, data.southwest.lat],
          [data.northeast.lng, data.southwest.lat],
        ]}
      />
    )
  }

  if (data.type === 'Circle' && data.center && data.radius) {
    return (
      <OverlayCircle
        data={''}
        primitives={viewer.scene.primitives}
        isGround={true}
        center={[data.center.lng, data.center.lat]}
        radius={data.radius}
        asynchronous={false}
        fill={'#3b82f6'}
        fillOpacity={0.2}
        stroke={'#3b82f6'}
      />
    )
  }

  if (data.type === 'Point' && data.points) {
    return data.points.map((e, i) => {
      const position = Cesium.Cartesian3.fromDegrees(
        e.lng,
        e.lat,
        viewer.scene.globe.getHeight(
          Cesium.Cartographic.fromDegrees(e.lng, e.lat),
        ) ?? 0,
      )
      return (
        <PointPrimitive
          id={i}
          position={position}
          color={Cesium.Color.fromCssColorString('#3b82f6')}
          pixelSize={10}
          outlineColor={Cesium.Color.fromCssColorString('#fff')}
          outlineWidth={1}
        />
      )
    })
  }

  return null
})

TanqiFlyPlan.displayName = 'TanqiFlyPlan'

export default TanqiFlyPlan
