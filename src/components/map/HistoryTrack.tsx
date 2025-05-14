import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import { attempt } from 'lodash'

type PropsType = {
  value: {
    lng: number
    lat: number
    alt?: number
  }[]
  /** @deprecated 这个参数已经没有用了 */
  useCallback?: boolean
  useOutline?: boolean
  color?: string
  clampToGround?: boolean
}

/** 历史轨迹 */
const HistoryTrack: FC<PropsType> = memo(
  ({
    value: historyTrack,
    useOutline = false,
    color = '#ef4444',
    clampToGround = false,
  }) => {
    const { viewer } = useCesium()

    const appearance = useMemo(
      () =>
        new Cesium.PolylineMaterialAppearance({
          material: Cesium.Material.fromType(Cesium.Material.ColorType, {
            color: Cesium.Color.fromCssColorString(color),
          }),
        }),
      [color],
    )

    useEffect(() => {
      if (!viewer || historyTrack.length < 2) {
        return
      }

      let primitive: Cesium.GroundPolylinePrimitive | Cesium.Primitive | null =
        null

      if (clampToGround) {
        // 贴地情况
        primitive = new Cesium.GroundPolylinePrimitive({
          geometryInstances: new Cesium.GeometryInstance({
            geometry: new Cesium.GroundPolylineGeometry({
              positions: historyTrack.map((v) =>
                Cesium.Cartesian3.fromDegrees(v.lng, v.lat),
              ),
              width: 2,
            }),
          }),
          appearance,
          asynchronous: false,
        })
      } else {
        // 不贴地情况
        primitive = new Cesium.Primitive({
          geometryInstances: new Cesium.GeometryInstance({
            geometry: new Cesium.PolylineGeometry({
              positions: historyTrack.map((v) =>
                Cesium.Cartesian3.fromDegrees(v.lng, v.lat, v.alt ?? 0),
              ),
              width: 2,
            }),
            attributes: {
              color: Cesium.ColorGeometryInstanceAttribute.fromColor(
                Cesium.Color.fromCssColorString(color),
              ),
            },
          }),
          appearance,
          asynchronous: false,
        })
      }

      viewer.scene.primitives.add(primitive)

      return () => {
        attempt(() => {
          if (primitive && viewer.scene.primitives) {
            viewer.scene.primitives.remove(primitive)
          }
        })
      }
    }, [viewer, historyTrack, appearance, clampToGround, useOutline])

    // const historyTrackRef = useLatest(historyTrack)

    // 不使用 callback 的方式
    // useEffect(() => {
    //   if (!viewer?.scene || useCallback) {
    //     return
    //   }
    //   // 添加路径
    //   const e = viewer.entities.add({
    //     polyline: {
    //       positions: Cesium.Cartesian3.fromDegreesArrayHeights(
    //         flatten(historyTrack.map((v) => [v.lng, v.lat, v.alt ?? 0])),
    //       ),
    //       width: 2,
    //       material: Cesium.Color.fromCssColorString(color),
    //       clampToGround,
    //     },
    //   })
    //   let outline: Cesium.Entity | null = null
    //   if (useOutline) {
    //     outline = viewer.entities.add({
    //       polyline: {
    //         positions: Cesium.Cartesian3.fromDegreesArrayHeights(
    //           flatten(historyTrack.map((v) => [v.lng, v.lat, v.alt ?? 0])),
    //         ),
    //         width: 2,
    //         material: Cesium.Color.fromCssColorString('#000'),
    //         clampToGround,
    //         zIndex: 1,
    //       },
    //     })
    //   }
    //   return () => {
    //     attempt(() => viewer.entities.remove(e))
    //     attempt(() => outline && viewer.entities.remove(outline))
    //   }
    // }, [viewer, historyTrack, useCallback, useOutline])

    // 使用 callback 的方式
    // useEffect(() => {
    //   if (!viewer?.scene || !useCallback) {
    //     return
    //   }

    //   const positions = new Cesium.CallbackProperty((_, result) => {
    //     const positions = Cesium.Cartesian3.fromDegreesArrayHeights(
    //       flatten(
    //         historyTrackRef.current.map((v) => [v.lng, v.lat, v.alt ?? 0]),
    //       ),
    //     )
    //     if (Cesium.defined(result)) {
    //       result.length = 0 // 清空现有数组
    //       result.push(...positions)
    //     }
    //     return positions
    //   }, false)

    //   // 添加路径
    //   const e = viewer.entities.add({
    //     polyline: {
    //       positions,
    //       width: 2,
    //       material: Cesium.Color.fromCssColorString(color),
    //       clampToGround,
    //       zIndex: 1,
    //     },
    //   })

    //   let outline: Cesium.Entity | null = null
    //   if (useOutline) {
    //     outline = viewer.entities.add({
    //       polyline: {
    //         positions,
    //         width: 5,
    //         material: Cesium.Color.fromCssColorString('#000'),
    //         clampToGround,
    //       },
    //     })
    //   }

    //   return () => {
    //     attempt(() => viewer.entities.remove(e))
    //     attempt(() => outline && viewer.entities.remove(outline))
    //   }
    // }, [viewer, historyTrackRef, useCallback, useOutline, clampToGround])

    return null
  },
)

export default HistoryTrack
