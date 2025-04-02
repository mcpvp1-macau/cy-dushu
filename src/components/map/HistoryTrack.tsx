import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import { attempt, flatten } from 'lodash'
import { useLatest } from 'ahooks'

type PropsType = {
  value: {
    lng: number
    lat: number
    alt?: number
  }[]
  useCallback?: boolean
  useOutline?: boolean
  color?: string
}

// const drawImage = (startColor: string, endColor: string) => {
//   const canvas = document.createElement('canvas')
//   const ctx = canvas.getContext('2d')
//   if (!ctx) {
//     return
//   }
//   const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
//   gradient.addColorStop(0, startColor)
//   gradient.addColorStop(1, endColor)
//   ctx.fillStyle = gradient
//   ctx.fillRect(0, 0, canvas.width, canvas.height)
//   return canvas
// }

/** 历史轨迹 */
const HistoryTrack: FC<PropsType> = memo(
  ({
    value: historyTrack,
    useCallback = false,
    useOutline = false,
    color = '#ef4444',
  }) => {
    const { viewer } = useCesium()
    const historyTrackRef = useLatest(historyTrack)

    // 不使用 callback 的方式
    useEffect(() => {
      if (!viewer?.scene || useCallback) {
        return
      }
      // 添加路径
      const e = viewer.entities.add({
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArrayHeights(
            flatten(historyTrack.map((v) => [v.lng, v.lat, v.alt ?? 0])),
          ),
          width: 2,
          material: Cesium.Color.fromCssColorString(color),
          // clampToGround: true,
        },
      })
      let outline: Cesium.Entity | null = null
      if (useOutline) {
        outline = viewer.entities.add({
          polyline: {
            positions: Cesium.Cartesian3.fromDegreesArrayHeights(
              flatten(historyTrack.map((v) => [v.lng, v.lat, v.alt ?? 0])),
            ),
            width: 2,
            material: Cesium.Color.fromCssColorString('#000'),
            // clampToGround: true,
            zIndex: 1,
          },
        })
      }
      return () => {
        attempt(() => viewer.entities.remove(e))
        attempt(() => outline && viewer.entities.remove(outline))
      }
    }, [viewer, historyTrack, useCallback, useOutline])

    // 使用 callback 的方式
    useEffect(() => {
      if (!viewer?.scene || !useCallback) {
        return
      }

      const positions = new Cesium.CallbackProperty((_, result) => {
        const positions = Cesium.Cartesian3.fromDegreesArrayHeights(
          flatten(
            historyTrackRef.current.map((v) => [v.lng, v.lat, v.alt ?? 0]),
          ),
        )
        if (Cesium.defined(result)) {
          result.length = 0 // 清空现有数组
          result.push(...positions)
        }
        return positions
      }, false)

      // 添加路径
      const e = viewer.entities.add({
        polyline: {
          positions,
          width: 2,
          material: Cesium.Color.fromCssColorString(color),
          // clampToGround: true,
          zIndex: 1,
        },
      })

      let outline: Cesium.Entity | null = null
      if (useOutline) {
        outline = viewer.entities.add({
          polyline: {
            positions,
            width: 5,
            material: Cesium.Color.fromCssColorString('#000'),
            // clampToGround: true,
          },
        })
      }

      return () => {
        attempt(() => viewer.entities.remove(e))
        attempt(() => outline && viewer.entities.remove(outline))
      }
    }, [viewer, historyTrackRef, useCallback, useOutline])

    return null
  },
)

export default HistoryTrack
