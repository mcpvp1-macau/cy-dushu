import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import { attempt } from 'lodash'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { useDebounceEffect, useLatest } from 'ahooks'
import { makeMemoCallbackProperty } from '@/utils/cesium/memoCallbackProperty'

type PropsType = {
  gimbalPick: {
    leftTop: number[]
    leftBottom: number[]
    rightTop: number[]
    rightBottom: number[]
  }
  videoElement: HTMLVideoElement
}

/** 视频投影 */
const VideoProjection: FC<PropsType> = memo((props) => {
  const { viewer } = useCesium()
  const entityRef = useRef<Cesium.Entity | null>(null)

  const gimbalYaw = useUavControlRoomStore((s) => s.state.gimbalYaw ?? 0)
  const gimbalPickLatest = useLatest(props.gimbalPick)
  const gimbalYawLatest = useLatest(gimbalYaw)

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
          entityRef.current && viewer.entities.remove(entityRef.current)
        })
      }
    },
    [props.videoElement, viewer],
    { wait: 300 },
  )

  return null
})

VideoProjection.displayName = 'VideoProjection'

export default VideoProjection
