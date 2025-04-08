import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { useShallow } from 'zustand/react/shallow'
import MapUavRealMarker from '@/components/map/device/UavRealMarker'
import { useCesium } from 'resium'
import { CameraVertexPicker } from '@/utils/cesium/camera/camera-vertex-pick'
import { getGimbalInfo } from '@/constant/uav/gimbal'
import { limitNum } from '@/utils/math'
import CameraGroundFrustum from '@/components/map/device/CameraGroundFrustum'

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

  const gimbalPick = useMemo(() => {
    if (!pickerRef.current) {
      return {}
    }

    const gimbalInfo = getGimbalInfo(state.cameraType)
    const zoom =
      state.lensType === 'wide' ? 1 : limitNum(state.zoomFactor, 1, 200)
    let focal = gimbalInfo.wide_focal
    if (state.lensType !== 'wide') {
      const df =
        (gimbalInfo.max_focal - gimbalInfo.min_focal) /
        (gimbalInfo.max_ratio - 2)
      focal = gimbalInfo.min_focal + df * (zoom - 2)
    }

    const w =
      state.lensType !== 'wide' ? gimbalInfo.camera_w : gimbalInfo.wide_camera_w
    const aspect =
      state.lensType !== 'wide'
        ? gimbalInfo.camera_w / gimbalInfo.camera_h
        : gimbalInfo.wide_camera_w / gimbalInfo.wide_camera_h

    const res = pickerRef.current.getGimbalPick(
      {
        lon: state.longitude,
        lat: state.latitude,
        alt: state.altitude,
      },
      { yaw: state.gimbalYaw, pitch: state.gimbalPitch, roll: 0 },
      focal,
      w,
      aspect,
      1,
    )

    return res
  }, [state])

  const gimbalPickExist =
    gimbalPick.leftTop &&
    gimbalPick.rightTop &&
    gimbalPick.rightBottom &&
    gimbalPick.leftBottom

  return (
    <>
      {gimbalPickExist && (
        <CameraGroundFrustum
          gimbalPick={gimbalPick as any}
          position={[state.longitude, state.latitude, state.altitude ?? 0]}
        />
      )}
      <MapUavRealMarker data={state} useGimbal={!gimbalPickExist} />
    </>
  )
})

UavMarker.displayName = 'UavMarker'

export default UavMarker
