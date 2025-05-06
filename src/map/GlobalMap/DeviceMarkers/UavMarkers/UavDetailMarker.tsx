import MapUavRealMarker from '@/components/map/device/UavRealMarker'
import HistoryTrack from '@/components/map/HistoryTrack'
import { emtpyObject } from '@/constant/data'
import useRealTrack3D from '@/hooks/device/useRealTrack3D'
import HeightDashLine from '@/map/CesiumMap/components/service/common/HeightDashLine'
import useMapDevicesStore from '@/store/map/useMapDevices.store'
import { CameraVertexPicker } from '@/utils/cesium/camera/camera-vertex-pick'
import { useCesium } from 'resium'
import useCollectCameraScanAreas from '@/hooks/device/useCollectCameraScanAreas'
import CameraGroundFrustum from '@/components/map/device/CameraGroundFrustum'
import { useShallow } from 'zustand/react/shallow'
import useCalcGimbalParams from '@/hooks/device/uav/useCalcGimbalParams'
import useGlobalWsStore from '@/store/useGlobalWebSocket.store'
import DeviceLabel from '@/components/map/device/DeviceLabel'
import * as Cesium from 'cesium'
import VideoProjection from '@/pages/control-room/uav/components/ControlRoomMap/components/VideoProjection'

type PropsType = {
  deviceId: string
  onPositionChange?: (position: {
    longitude: number
    latitude: number
    altitude: number
  }) => void
}

const UavDetailMarker: FC<PropsType> = memo(
  ({ deviceId, onPositionChange }) => {
    const state = useMapDevicesStore(
      useShallow((s) => s.uavStates[deviceId] ?? emtpyObject),
    )

    const deviceName = useGlobalWsStore(
      (s) => s.deviceRealtimeProperties[deviceId]?.deviceName,
    )

    const { historyTrack, realTrack, clear } = useRealTrack3D(
      state.longitude ?? 0,
      state.latitude ?? 0,
      state.altitude ?? 0,
    )

    const { viewer } = useCesium()
    const pickerRef = useRef<CameraVertexPicker | null>(null)
    const lastCameraTypeRef = useRef<string | null>(null)

    if (lastCameraTypeRef.current !== state.cameraType && viewer) {
      lastCameraTypeRef.current = state.cameraType
      pickerRef.current = new CameraVertexPicker(viewer)
    }

    const gimbalState = useCalcGimbalParams(
      state.cameraType,
      state.lensType as 'wide' | 'zoom' | 'ir',
      state.zoomFactor,
    )

    const gimbalPick = useMemo(() => {
      if (!pickerRef.current) {
        return {}
      }

      const res = pickerRef.current.getGimbalPick(
        {
          lon: state.longitude,
          lat: state.latitude,
          alt: state.altitude,
        },
        { yaw: state.gimbalYaw, pitch: state.gimbalPitch, roll: 0 },
        gimbalState.focal,
        gimbalState.width,
        gimbalState.width / gimbalState.height,
        1,
      )

      return res
    }, [state, gimbalState])

    useEffect(() => {
      clear(true)
    }, [deviceId])

    useCollectCameraScanAreas(gimbalPick, (scanArea) => {
      useMapDevicesStore.getState().updateScanAreas({
        ...useMapDevicesStore.getState().scanAreas,
        [deviceId]: scanArea,
      })
    })

    useEffect(() => {
      return () => {
        const next = { ...useMapDevicesStore.getState().scanAreas }
        delete next[deviceId]
        useMapDevicesStore.getState().updateScanAreas(next)
      }
    }, [deviceId])

    const projectedVideo = useMapDevicesStore(
      (s) => s.projectedVideos[deviceId],
    )

    useEffect(() => {
      if (onPositionChange) {
        onPositionChange({
          longitude: state.longitude,
          latitude: state.latitude,
          altitude: state.altitude ?? 0,
        })
      }
    }, [state, onPositionChange])

    if (!state) {
      return null
    }

    const gimbalPickExist =
      gimbalPick.leftTop &&
      gimbalPick.rightTop &&
      gimbalPick.rightBottom &&
      gimbalPick.leftBottom

    const position = Cesium.Cartesian3.fromDegrees(
      state.longitude,
      state.latitude,
      state.altitude ?? 0,
    )

    return (
      <>
        <HeightDashLine
          position={[state.longitude, state.latitude, state.altitude ?? 0]}
          color="#fff"
        />
        <DeviceLabel id={deviceId} text={deviceName} position={position} />
        <MapUavRealMarker data={state} useGimbal={!gimbalPickExist} />
        {historyTrack.map((track, index) => (
          <HistoryTrack key={index} value={track} />
        ))}
        {realTrack.length > 1 && <HistoryTrack value={realTrack} useCallback />}
        {gimbalPickExist && (
          <CameraGroundFrustum
            gimbalPick={gimbalPick as any}
            position={[state.longitude, state.latitude, state.altitude ?? 0]}
          />
        )}
        {gimbalPickExist && projectedVideo?.videoElement && (
          <VideoProjection
            gimbalPick={gimbalPick as Required<typeof gimbalPick>}
            gimbalYaw={state.gimbalYaw ?? 0}
            videoElement={projectedVideo.videoElement}
          />
        )}
      </>
    )
  },
)

UavDetailMarker.displayName = 'UavDetailMarker'

export default UavDetailMarker
