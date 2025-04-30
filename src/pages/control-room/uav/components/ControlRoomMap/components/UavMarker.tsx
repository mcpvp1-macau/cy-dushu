import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { useShallow } from 'zustand/react/shallow'
import MapUavRealMarker from '@/components/map/device/UavRealMarker'
import { useCesium } from 'resium'
import { CameraVertexPicker } from '@/utils/cesium/camera/camera-vertex-pick'
import CameraGroundFrustum from '@/components/map/device/CameraGroundFrustum'
import useCalcGimbalParams from '@/hooks/device/uav/useCalcGimbalParams'
import HeightDashLine from '@/map/CesiumMap/components/service/common/HeightDashLine'
import VideoProjection from './VideoProjection'

type PropsType = unknown

/** 无人机图标 */
const UavMarker: FC<PropsType> = memo(() => {
  const state = useUavControlRoomStore(
    useShallow((s) => ({
      longitude: s.state.longitude ?? 0,
      latitude: s.state.latitude ?? 0,
      altitude: s.state.altitude ?? 0,
      gimbalYaw: s.state.gimbalHead ?? 0,
      gimbalPitch: s.state.gimbalPitch ?? 0,
      lensType: s.state.lensType ?? 'wide',
      zoomFactor: s.state.zoomFactor ?? 1,
      cameraType: s.state.gimbalType || s.state.cameraType,
      uavYaw: s.state.uavYaw ?? 0,
    })),
  )

  const { viewer } = useCesium()
  const pickerRef = useRef<CameraVertexPicker | null>(null)
  const lastCameraTypeRef = useRef<string | null>(null)

  if (lastCameraTypeRef.current !== state.cameraType && viewer) {
    lastCameraTypeRef.current = state.cameraType
    pickerRef.current = new CameraVertexPicker(viewer)
  }

  const gimbalState = useCalcGimbalParams(
    state.cameraType as string,
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

  const gimbalPickExist =
    gimbalPick.leftTop &&
    gimbalPick.rightTop &&
    gimbalPick.rightBottom &&
    gimbalPick.leftBottom

  const openVideoProjection = useUavControlRoomStore(
    (s) => s.openVideoProjection,
  )

  const videoElement = useUavControlRoomStore((s) => s.videoElement)

  return (
    <>
      {gimbalPickExist && (
        <CameraGroundFrustum
          gimbalPick={gimbalPick as any}
          position={[state.longitude, state.latitude, state.altitude ?? 0]}
          useBottomSurface={!openVideoProjection}
        />
      )}
      <MapUavRealMarker data={state} useGimbal={!gimbalPickExist} />
      <HeightDashLine
        position={[state.longitude, state.latitude, state.altitude ?? 0]}
      />
      {gimbalPickExist && openVideoProjection && videoElement && (
        <VideoProjection
          gimbalPick={gimbalPick as Required<typeof gimbalPick>}
          videoElement={videoElement}
        />
      )}
    </>
  )
})

UavMarker.displayName = 'UavMarker'

export default UavMarker
