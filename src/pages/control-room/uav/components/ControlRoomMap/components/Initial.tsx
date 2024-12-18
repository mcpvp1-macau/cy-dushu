import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { memo, type FC } from 'react'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'

type PropsType = unknown

/** UAV 地图初始化 */
const UavMapInitial: FC<PropsType> = memo(() => {
  const lon = useDeviceDetailStore((s) => s.deviceDetail?.properties.longitude)
  const lat = useDeviceDetailStore((s) => s.deviceDetail?.properties.latitude)
  const { viewer } = useCesium()
  useEffect(() => {
    if (!viewer?.camera) {
      return
    }

    if (lon && lat) {
      viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(lon, lat, 1500),
        orientation: {
          heading: Cesium.Math.toRadians(0),
          pitch: Cesium.Math.toRadians(-90),
          roll: 0,
        },
      })
    }
  }, [lon, lat])

  return null
})

UavMapInitial.displayName = 'UavMapInitial'

export default UavMapInitial
