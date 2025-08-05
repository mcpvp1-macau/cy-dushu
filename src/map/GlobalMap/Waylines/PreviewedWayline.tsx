import { WaylineEnum } from '@/constant/uav/wayline'
import GroundWayline from '@/map/CesiumMap/components/service/Wayline/GroundWayline'
import UavWayline from '@/map/CesiumMap/components/service/Wayline/UavAirline'
import UavAreaWayline from '@/map/CesiumMap/components/service/Wayline/UavAreaWayline'
import useWaylinesStore from '@/store/map/useWaylines.store'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'

type PropsType = unknown

/** 预览航线 */
const PreviewedWayline: FC<PropsType> = memo(() => {
  const e = useWaylinesStore((s) => s.previewedWayline)
  const { viewer } = useCesium()

  useEffect(() => {
    if (!e || !viewer) {
      return
    }

    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    e.points.forEach((point) => {
      minX = Math.min(minX, point.pointX)
      minY = Math.min(minY, point.pointY)
      maxX = Math.max(maxX, point.pointX)
      maxY = Math.max(maxY, point.pointY)
    })

    const disX = (maxX - minX) * 0.4
    const disY = (maxY - minY) * 0.4

    viewer.camera.flyTo({
      destination: Cesium.Rectangle.fromDegrees(
        minX - disX,
        minY - disY,
        maxX + disX,
        maxY + disY,
      ),
      duration: 1,
    })
  }, [e])

  if (!e) {
    return null
  }

  if (e.type === WaylineEnum.PointWayline) {
    return (
      <UavWayline
        key={e.id}
        data={e.points}
        executeDeviceId={e.executeDeviceId}
        taskBasic={e.taskBasic}
      />
    )
  }
  if (e.type === WaylineEnum.AreaWayline) {
    return <UavAreaWayline key={e.id} data={e.points} taskBasic={e.taskBasic} />
  }
  if (e.type === WaylineEnum.RebotDogWayline) {
    return <GroundWayline key={e.id} data={e.points} />
  }
  return null
})

PreviewedWayline.displayName = 'PreviewedWayline'

export default PreviewedWayline
