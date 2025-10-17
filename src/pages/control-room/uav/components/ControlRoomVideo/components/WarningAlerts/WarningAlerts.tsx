import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import useFlightAreaStore from '@/store/map/useFlightArea.store'
import { shouldJson } from '@/utils/json'
import { WarningOutlined } from '@ant-design/icons'
import { useShallow } from 'zustand/react/shallow'
import * as turf from '@turf/turf'
import { WarningAlertType } from './warning_alert_constants'
import useWarningAudioBuffer from './useWarningAuidoBuffer'
import useGlobalWsStore from '@/store/useGlobalWebSocket.store'
import { getSpaceDistance } from '@/utils/geo-math'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'

type PropsType = unknown

const WarningAlerts: FC<PropsType> = memo(() => {
  const deviceId = useDeviceDetailStore((s) => s.deviceId)
  const state = useUavControlRoomStore(
    useShallow((s) => ({
      lon: s.state.longitude,
      lat: s.state.latitude,
      alt: s.state.altitude,
      homeLon: s.state.gohomeLongitude,
      homeLat: s.state.gohomeLatitude,
    })),
  )

  const audioBuffers = useWarningAudioBuffer()
  const flightAreaList = useFlightAreaStore((s) => s.flightAreaList)

  const noFlyZones = useMemo(
    () =>
      flightAreaList
        .filter(
          (e) =>
            e.overlayExtType === 'NO_FLY_ZONE' &&
            ['POLYGON', 'CIRCULAR'].includes(e.overlayType),
        )
        .map((e) => {
          const positions = shouldJson(e.overlayPositions)
          if (e.overlayType === 'POLYGON') {
            const polygon = turf.polygon([
              [...positions, positions[0]].map((p) => [p[0], p[1]]),
            ])
            return polygon
          }
          const circle = turf.circle(
            [positions[0][0], positions[0][1]],
            positions[0][3],
            { units: 'meters', steps: 64 },
          )
          return circle
        }),
    [flightAreaList],
  )

  const [warnings, setWarnings] = useState<Set<WarningAlertType>>(new Set())
  const [closeDeviceName, setCloseDeviceName] = useState<string | null>(null)

  const toggleWarning = useMemoizedFn((type: WarningAlertType, on: boolean) => {
    setWarnings((prev) => {
      const newSet = new Set(prev)
      if (on) {
        if (!newSet.has(type)) {
          // 从无到有
          const audioBuffer = audioBuffers?.[type]
          if (audioBuffer) {
            const audioCtx = new AudioContext()
            const source = audioCtx.createBufferSource()
            source.buffer = audioBuffer
            source.connect(audioCtx.destination)
            source.start(0)
          }
        }
        newSet.add(type)
      } else {
        newSet.delete(type)
      }
      return newSet
    })
  })

  useEffect(() => {
    if (!audioBuffers) {
      // 警报声还没预备好
      return
    }
    if (!state.lon || !state.lat) {
      // 无人机坐标异常
      return
    }

    // 判断无人机是否存在于禁飞区内
    const point = turf.point([state.lon, state.lat])
    const inNoFlyZone = noFlyZones.some((zone) =>
      turf.booleanPointInPolygon(point, zone),
    )
    toggleWarning(WarningAlertType.InNoFlyZoneAlert, inNoFlyZone)
    if (inNoFlyZone) {
      toggleWarning(WarningAlertType.RTHInNoFlyZoneAlert, false)
      return
    }

    // 判断返航航线是否经过禁飞区
    if (!state.homeLon || !state.homeLat) {
      return
    }
    const line = turf.lineString([
      [state.lon, state.lat],
      [state.homeLon, state.homeLat],
    ])

    const rthInNoFlyZone = noFlyZones.some((zone) =>
      turf.booleanIntersects(zone, line),
    )
    toggleWarning(WarningAlertType.RTHInNoFlyZoneAlert, rthInNoFlyZone)
  }, [state, noFlyZones, audioBuffers])

  const deviceRealtimeProperties = useGlobalWsStore(
    (s) => s.deviceRealtimeProperties,
  )
  useEffect(() => {
    if (!state.lon || !state.lat || !state.alt) {
      return
    }
    const devices = Object.values(deviceRealtimeProperties)

    const isClose = devices.some((d) => {
      const pro = d.properties
      if (
        d.deviceId === deviceId ||
        d.deviceStatus !== 'ONLINE' ||
        !pro ||
        !pro.longitude ||
        !pro.latitude ||
        !pro.altitude
      ) {
        return
      }
      const isClose =
        getSpaceDistance([
          [state.lon, state.lat, state.alt],
          [pro.longitude, pro.latitude, pro.altitude],
        ]) < 20
      if (isClose) {
        setCloseDeviceName(d.deviceName)
      }
      return isClose
    })
    toggleWarning(WarningAlertType.DistanceAlert, isClose)
  }, [deviceId, state, deviceRealtimeProperties])

  if (warnings.size === 0) {
    return null
  }

  return (
    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-[#16202bcc] p-2 rounded flex gap-2 backdrop-blur">
      <WarningOutlined className="text-yellow-500 animate-pulse" />
      <div>
        <div className="text-sm text-fore">
          {Array.from(warnings).map((w) => {
            switch (w) {
              case WarningAlertType.DistanceAlert:
                return (
                  '与其他设备距离过近' +
                  (closeDeviceName ? ` (${closeDeviceName})` : '')
                )
              case WarningAlertType.InNoFlyZoneAlert:
                return '进入禁飞区'
              case WarningAlertType.RTHInNoFlyZoneAlert:
                return '返航经过禁飞区'
              case WarningAlertType.DeviationFromFlightPathAlert:
                return '偏离航线'
              case WarningAlertType.LowBatteryAlert:
                return '低电量报警'
              default:
                return null
            }
          })}
        </div>
      </div>
    </div>
  )
})

WarningAlerts.displayName = 'WarningAlerts'

export default WarningAlerts
