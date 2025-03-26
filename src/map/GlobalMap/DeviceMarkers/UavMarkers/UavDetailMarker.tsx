import MapUavRealMarker from '@/components/map/device/UavRealMarker'
import HistoryTrack from '@/components/map/HistoryTrack'
import { emtpyObject } from '@/constant/data'
import { getGimbalInfo } from '@/constant/uav/gimbal'
import useRealTrack3D from '@/hooks/device/useRealTrack3D'
import HeightDashLine from '@/map/CesiumMap/components/service/common/HeightDashLine'
import useMapDevicesStore from '@/store/map/useMapDevices.store'
import { CameraVertexPicker } from '@/utils/cesium/camera/camera-vertex-pick'
import { useCesium } from 'resium'
import { limitNum } from '@/utils/math'
import useCollectCameraScanAreas from '@/hooks/device/useCollectCameraScanAreas'

type PropsType = {
  deviceId: string
}

const UavDetailMarker: FC<PropsType> = memo(({ deviceId }) => {
  const state = useMapDevicesStore((s) => s.uavStates[deviceId] ?? emtpyObject)

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

  const gimbalPick = useMemo(() => {
    if (!pickerRef.current) {
      return {}
    }

    const gimbalInfo = getGimbalInfo(state.cameraType)

    const res = pickerRef.current.getGimbalPick(
      {
        lon: state.longitude,
        lat: state.latitude,
        alt: state.altitude,
      },
      { yaw: state.uavYaw, pitch: state.gimbalPitch, roll: 0 },
      gimbalInfo.wide_focal,
      gimbalInfo.wide_camera_w,
      gimbalInfo.wide_camera_w / gimbalInfo.wide_camera_h,
      state.lensType === 'wide' ? 1 : limitNum(state.zoomFactor, 1, 200),
    )

    return res
  }, [state])

  useEffect(() => {
    clear(true)
  }, [deviceId])

  useCollectCameraScanAreas(gimbalPick, (scanArea) => {
    // console.log('scanArea', scanArea)
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

  if (!state) {
    return null
  }

  return (
    <>
      <HeightDashLine
        position={[state.longitude, state.latitude, state.altitude ?? 0]}
        color="#fff"
      />
      <MapUavRealMarker data={state} />
      {historyTrack.map((track, index) => (
        <HistoryTrack key={index} value={track} />
      ))}
      {realTrack.length > 1 && <HistoryTrack value={realTrack} useCallback />}
    </>
  )
})

UavDetailMarker.displayName = 'UavDetailMarker'

export default UavDetailMarker
