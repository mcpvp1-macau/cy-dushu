import { memo, useEffect, type FC } from 'react'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import { useLatest } from 'ahooks'
import useAirlineConfigStore from '@/store/wayline/uav-airline/useAirlineConfig.store'
import { cartesian3ToDegrees } from '@/utils/geoUtils'

type PropsType = unknown

const AddPoint: FC<PropsType> = () => {
  const { viewer } = useCesium()

  const height = useAirlineConfigStore((s) => s.airlineConfig.height)
  const isDrawPoint = useAirlineConfigStore((s) => s.isDrawPoint)
  const addAirPoint = useAirlineConfigStore((s) => s.addAirPoint)

  const heightRef = useLatest(height)

  useEffect(() => {
    if (!viewer) return
    if (!isDrawPoint) {
      viewer.scene.canvas.style.cursor = 'default'
      return
    }

    const handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas)

    handler.setInputAction(
      (e: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
        const ray = viewer.camera.getPickRay(e.position)
        if (!ray) return
        const cartesian = viewer.scene.globe.pick(ray, viewer.scene)
        if (!cartesian) return
        // 地形上的点
        const geo = cartesian3ToDegrees(cartesian)
        addAirPoint({
          pointX: geo[0],
          pointY: geo[1],
          pointZ: heightRef.current ?? geo[2],
        })
        // setIsDrawPoint(false);
      },
      Cesium.ScreenSpaceEventType.LEFT_CLICK,
    )
    return () => {
      handler.destroy()
    }
  }, [isDrawPoint])

  return <></>
}

export default memo(AddPoint)
