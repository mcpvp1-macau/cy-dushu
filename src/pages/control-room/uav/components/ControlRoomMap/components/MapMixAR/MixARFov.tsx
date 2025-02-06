import useMixARStore from '@/store/control-room/useMixAR.store'
import { memo, useEffect, useRef, type FC } from 'react'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import { attempt, flatten } from 'lodash'
import { useLatest } from 'ahooks'

type PropsType = unknown

const useDashLine = (
  positions: Cesium.CallbackProperty,
  viewer?: Cesium.Viewer,
) => {
  // LiqunLog.log('useDashLine', positions);
  useEffect(() => {
    if (!viewer) {
      return
    }
    const e = viewer.entities.add({
      polyline: {
        positions,
        width: 1,
        material: new Cesium.PolylineDashMaterialProperty({
          color: Cesium.Color.fromCssColorString('#22c55e'),
          dashLength: 8,
        }),
      },
    })
    return () => {
      attempt(() => {
        viewer.entities.remove(e)
      })
    }
  }, [viewer, positions])
}

const MixARFov: FC<PropsType> = memo(() => {
  const { viewer } = useCesium()
  const gimbalPick = useMixARStore((s) => s.gimbalPick)
  const uav = useMixARStore((s) => s.uavProperties)
  const gimbalPickRef = useLatest(gimbalPick)
  const uavRef = useLatest(uav)

  useEffect(() => {
    if (!viewer?.scene) {
      return
    }
    const positions = new Cesium.CallbackProperty((_, result) => {
      if (!gimbalPickRef.current || !gimbalPickRef.current.leftBottom) {
        return []
      }
      const fovs = [
        gimbalPickRef.current?.leftBottom,
        gimbalPickRef.current?.rightBottom,
        gimbalPickRef.current?.rightTop,
        gimbalPickRef.current?.leftTop,
        gimbalPickRef.current?.leftBottom,
      ].filter((v) => !!v) as number[][]

      if (fovs.length < 2) {
        fovs.push([0, 0], [0, 0])
      }
      const positions = Cesium.Cartesian3.fromDegreesArray(
        flatten(fovs.map((v) => [v[0], v[1]])),
      )
      if (Cesium.defined(result)) {
        result.length = 0 // 清空现有数组
        result.push(...positions)
      }
      return positions
    }, false)

    const e = viewer.entities.add({
      polyline: {
        positions,
        width: 1,
        material: Cesium.Color.fromCssColorString('#22c55e'),
      },
    })

    return () => {
      attempt(() => {
        viewer.entities.remove(e)
      })
    }
  }, [viewer])

  const callbacks = useRef<Record<string, Cesium.CallbackProperty> | null>(null)
  if (!callbacks.current) {
    const cbs: any = {}

    for (const key of [
      'leftBottom',
      'leftTop',
      'rightBottom',
      'rightTop',
    ] as const) {
      cbs[key] = new Cesium.CallbackProperty((_, result) => {
        const positions =
          !gimbalPickRef.current[key] ||
          !uavRef.current.longitude ||
          !uavRef.current.latitude
            ? []
            : [
                Cesium.Cartesian3.fromDegrees(
                  gimbalPickRef.current[key]![0],
                  gimbalPickRef.current[key]![1],
                  0,
                ),
                Cesium.Cartesian3.fromDegrees(
                  uavRef.current.longitude,
                  uavRef.current.latitude,
                  uavRef.current.altitude || 0,
                ),
              ]
        if (Cesium.defined(result)) {
          result.length = 0 // 清空现有数组
          result.push(...positions)
        }
        return positions
      }, false)
    }
    callbacks.current = cbs
  }

  useDashLine(callbacks.current!.leftBottom, viewer)
  useDashLine(callbacks.current!.leftTop, viewer)
  useDashLine(callbacks.current!.rightBottom, viewer)
  useDashLine(callbacks.current!.rightTop, viewer)

  return <></>
})

MixARFov.displayName = 'MixARFov'

export default MixARFov
