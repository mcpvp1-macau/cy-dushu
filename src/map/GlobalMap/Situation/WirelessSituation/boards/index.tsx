import { ComponentProps, memo, useEffect, useState, type FC } from 'react'
import SignalBoardMarker from './SignalBoardMarker'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import { cartesian3ToDegrees } from '@/utils/geoUtils'
import { cellToLatLng, latLngToCell } from 'h3-js'
import { useLatest } from 'ahooks'
import { omit } from 'lodash'
import signalStrParse from '@/utils/signal-parse'
import useWirelessSituationStore from '@/store/map/useSignalLayer.store'

type PropsType = {
  level: number
}

const SignalBoardMarkers: FC<PropsType> = memo(({ level }) => {
  const { viewer } = useCesium()

  const [activities, setActvities] = useState<
    Record<string, ComponentProps<typeof SignalBoardMarker>>
  >({})
  const activitiesRef = useLatest(activities)

  const ceilMap = useWirelessSituationStore((s) => s.ceilMap)

  useEffect(() => {
    if (level !== 13) {
      setActvities({})
      return
    }
    if (!viewer?.scene) {
      return
    }
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
    handler.setInputAction((e: any) => {
      const ray = viewer.camera.getPickRay(e.position)
      if (!ray) return
      const cartesian = viewer.scene.globe.pick(ray, viewer.scene)
      if (!cartesian) return
      // 地形上的点
      const geo = cartesian3ToDegrees(cartesian)
      const cell = latLngToCell(geo[1], geo[0], 13)

      if (!ceilMap[cell]) {
        return
      }
      if (!activitiesRef.current[cell]) {
        const res = signalStrParse(ceilMap[cell])
        const [lat, lng] = cellToLatLng(cell)
        setActvities({
          ...activitiesRef.current,
          [cell]: {
            deviceId: res.deviceId,
            h3code: cell,
            quality: res.quality,
            snr: res.sinr,
            ts: res.ts,
            lng,
            lat,
            altitude: res.altitude,
          },
        })
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

    return () => {
      handler.destroy()
    }
  }, [level])

  return (
    <>
      {Object.entries(activities).map(([key, item]) => (
        <SignalBoardMarker
          key={key}
          {...item}
          onClose={() => {
            setActvities(omit(activitiesRef.current, key))
          }}
        />
      ))}
    </>
  )
})

SignalBoardMarkers.displayName = 'SignalBoardMarkers'

export default SignalBoardMarkers
