import { memo, type FC } from 'react'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import mitt from 'mitt'
import { attempt } from 'lodash'

type FlyToOption = Parameters<InstanceType<typeof Cesium.Camera>['flyTo']>[0]

type BigFlyOption = {
  lng: number
  lat: number
  alt?: number
}

export const bigFlyEmitter = mitt<{
  flyTo: FlyToOption
  bigFly: BigFlyOption
}>()

type PropsType = unknown

/** flyTo 监听器 */
const BigFlyListener: FC<PropsType> = memo(() => {
  const viewer = useCesium()

  const flyTo = useMemoizedFn((option: FlyToOption) => {
    if (!viewer?.camera) {
      return
    }
    viewer.camera.flyTo(option)
  })

  const bigFly = useMemoizedFn(({ lng, lat, alt }: BigFlyOption) => {
    if (!viewer?.camera) {
      return
    }
    const cameraHeight =
      Math.round(viewer.camera.positionCartographic?.height ?? 0)
    const targetHeight = alt === undefined ? cameraHeight || 4000 : alt

    const destination = Cesium.Cartesian3.fromDegrees(
      lng,
      lat,
      targetHeight,
    )
    attempt(() => {
      viewer.camera?.flyTo({
        destination, //相机飞入点
        duration: 0.8,
      })
    })
  })

  useEffect(() => {
    if (!viewer) {
      return
    }
    bigFlyEmitter.on('flyTo', flyTo)
    bigFlyEmitter.on('bigFly', bigFly)
    return () => {
      bigFlyEmitter.off('flyTo', flyTo)
      bigFlyEmitter.off('bigFly', bigFly)
    }
  }, [viewer])

  return null
})

BigFlyListener.displayName = 'BigFlyListener'

export default BigFlyListener
