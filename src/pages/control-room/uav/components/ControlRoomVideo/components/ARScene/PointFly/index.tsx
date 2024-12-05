import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { memo, type FC } from 'react'
import useCalcPointFlyInfo from '../../../../ControlRoomMap/components/PointFly/hooks/useCalcPointFlyInfo'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import { attempt } from 'lodash'

const PointFlyInfo: FC = () => {
  const info = useCalcPointFlyInfo()
  const { viewer } = useCesium()

  useEffect(() => {
    if (!viewer || !info.tartgetLng || !info.tartgetLat) {
      return
    }

    const target = Cesium.Cartesian3.fromDegrees(
      info.tartgetLng,
      info.tartgetLat,
      info.targetHeight,
    )
    const e = viewer.entities.add({
      position: target,
      point: {
        pixelSize: 10,
        color: Cesium.Color.fromCssColorString('#3b82f6'),
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
      },
    })

    return () => {
      attempt(() => {
        viewer.entities.remove(e)
      })
    }
  }, [viewer, info.tartgetLng, info.tartgetLat, info.targetHeight])
  return null
}

type PropsType = unknown

const ARScenePointFly: FC<PropsType> = memo(() => {
  const displayMode = useUavControlRoomStore((s) => s.state.displayMode)
  const isPointFlying = displayMode?.startsWith('指点飞行')

  if (!isPointFlying) {
    return null
  }

  return <PointFlyInfo />
})

ARScenePointFly.displayName = 'ARScenePointFly'

export default ARScenePointFly
