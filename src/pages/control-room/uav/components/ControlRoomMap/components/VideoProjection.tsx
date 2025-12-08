import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import { attempt } from 'lodash'
import { useDebounceEffect, useLatest } from 'ahooks'
import { makeMemoCallbackProperty } from '@/utils/cesium/memoCallbackProperty'

type PropsType = {
  gimbalPick: {
    leftTop: number[]
    leftBottom: number[]
    rightTop: number[]
    rightBottom: number[]
  }
  gimbalYaw: number
  videoElement: HTMLVideoElement
}

/** 视频投影 */
const VideoProjection: FC<PropsType> = memo((props) => {
  const { viewer } = useCesium()
  const entityRef = useRef<Cesium.Entity | null>(null)

  const gimbalPickLatest = useLatest(props.gimbalPick)
  const gimbalYawLatest = useLatest(props.gimbalYaw)

  useDebounceEffect(
    () => {
      if (!viewer || !props.videoElement) return

      const position = makeMemoCallbackProperty(
        () => {
          const { leftTop, leftBottom, rightTop, rightBottom } =
            gimbalPickLatest.current
          const result = Cesium.Cartesian3.fromDegreesArray([
            leftTop[0],
            leftTop[1],
            rightTop[0],
            rightTop[1],
            rightBottom[0],
            rightBottom[1],
            leftBottom[0],
            leftBottom[1],
          ])
          return { positions: result }
        },
        false,
        () => [gimbalPickLatest.current],
      )

      const gimbalYaw = new Cesium.CallbackProperty(() => {
        return Cesium.Math.toRadians(gimbalYawLatest.current)
      }, false)

      entityRef.current = viewer.entities.add({
        polygon: {
          hierarchy: position,
          classificationType: Cesium.ClassificationType.BOTH,
          material: props.videoElement as unknown as Cesium.MaterialProperty,
          stRotation: gimbalYaw,
        },
      })

    return () => {
      attempt(() => {
        if (entityRef.current) {
          viewer.entities.remove(entityRef.current)
        }
      })
    }
    },
    [props.videoElement, viewer],
    { wait: 10, trailing: true },
  )

  return null
})

VideoProjection.displayName = 'VideoProjection'

export default VideoProjection
