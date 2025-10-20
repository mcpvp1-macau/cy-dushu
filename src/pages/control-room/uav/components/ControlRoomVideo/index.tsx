import DeviceLiveVideo from '@/components/VideoS/DeviceLiveVideo'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import LaserRanging from './LaserRanging'
import { useSearchParams } from 'react-router-dom'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { usePostDeviceService } from '@/hooks/device/usePostDeviceService'
import useMixARStore from '@/store/control-room/useMixAR.store'
import Avoidance from './components/Avoidance'
import ARSceneCesium from './components/ARSceneCesium'
import { AiObject } from '@/components/Video/Jessibuca/sei-types/ai-data'
import useSmarkTrack from '@/hooks/device/useSmarkTrack'
import ZoomFocus from './components/ZoomFocus'
import AITrackBoxSelect from './components/AITrackBoxSelect'
import { ComponentRef, lazy, Suspense } from 'react'
import useHandleTakePhotoEvent from './hooks/useHandleTakePhotoEvent'
import ZoomFocusMode from '../AsideToolBar/ZoomFucusMode'
import IrMetering from './components/IrMetering'
import ExposureMode from '../AsideToolBar/ExposureMode'
import PointOrBoxSelect from './components/PointOrBoxSelect/PointOrBoxSelect'
import TapToFlyOnVideo from './components/TapToFlyOnVideo'
import WarningAlerts from './components/WarningAlerts/WarningAlerts'

const ExposureValue = lazy(() => import('./components/ExposureValue'))
const ShutterValue = lazy(() => import('./components/ShutterValue'))

type PropsType = {
  onAspectRatioChange?: (aspectRatio: number) => void
}

const ControlRoomVideo: FC<PropsType> = memo(({ onAspectRatioChange }) => {
  const deviceId = useDeviceDetailStore((s) => s.deviceDetail?.deviceId)!
  const productKey = useDeviceDetailStore(
    (s) =>
      s.deviceDetail?.productKey || s.deviceDetail?.deviceModel?.productKey,
  )!
  const videoId = useDeviceDetailStore(
    (s) => s.deviceDetail?.properties.videoList?.[0]?.videoId,
  )!
  const sn = useDeviceDetailStore((s) => s.deviceDetail?.sn)

  const deviceTags = useDeviceDetailStore((s) => s.deviceDetail?.deviceTags)!

  const [searchParams] = useSearchParams()
  const useLW = searchParams.get('useLW')

  const videoQuality = useUavControlRoomStore((s) => s.state.videoQuality)
  const enableSmartTrack = useUavControlRoomStore((s) => s.enableSmartTrack)
  const postService = usePostDeviceService(productKey!, deviceId)

  const { handlePostSmartTrack } = useSmarkTrack(
    enableSmartTrack,
    postService,
    'autoTrack',
  )
  const liveSetQuality = (quality: string) => {
    postService('liveSetQuality', { quality })
  }

  // const enableMixAR = useControlRoomStore((s) => s.state.ar);
  const enableAR = useMixARStore((s) => s.enable)
  const updateEnableAR = useMixARStore((s) => s.updateEnable)
  const updateUavProperties = useMixARStore((s) => s.updateUavProperties)

  const handlePropertiesSei = (data: any) => {
    updateUavProperties(data)
  }

  /** 是否道通播放器 */
  const isRtcDemo = !!deviceTags?.find(
    (item: any) => item.tagName === 'PLAY_TYPE' && item.tagValue === 'DT_RTC',
  )?.tagValue

  const handleSeiClick = useMemoizedFn((e: AiObject) => {
    const { sourceFrameWidth: fw, sourceFrameHeight: fh, seq } = e
    if (!fw || !fh) return
    let x1 = e.bboxLeft ?? 0
    let y1 = e.bboxTop ?? 0
    const w = e.bboxWidth
    const h = e.bboxHeight
    if (!x1 && !y1 && !w && !h) return
    const x2 = (x1 + w) / fw
    const y2 = (y1 + h) / fh
    x1 = x1 / fw
    y1 = y1 / fh
    handlePostSmartTrack({
      x1,
      y1,
      x2,
      y2,
      enable: true,
      frame_no: seq,
      object_label: e.objectLabel,
      label_value: e.objLabelList?.[0]?.labelValue,
      object_id: e.objectId,
      objectId: e.objectId,
    })
  })

  const posizionZoomOpen = useUavControlRoomStore((s) => s.openPointZoom)
  const deviceLiveVideoRef = useRef<ComponentRef<typeof DeviceLiveVideo>>(null)

  const propsHave = useDeviceDetailStore((s) => s.propsHave)
  const serviceHave = useDeviceDetailStore((s) => s.serviceHave)
  const hasZoomFocusMode = !!propsHave['zoomFocusMode']
  const hasExposureSet = !!serviceHave['cameraExposureValueSet']
  const hasShutterSet = !!serviceHave['shutterSet']

  useHandleTakePhotoEvent(deviceLiveVideoRef)
  const postDeviceService = usePostDeviceService(productKey, deviceId)

  const irMeteringMode = useUavControlRoomStore((s) => s.state.irMeteringMode)

  const updateVideoElement = useUavControlRoomStore((s) => s.updateVideoElement)

  const openTapToFlyOnVideo = useUavControlRoomStore(
    (s) => s.openTapToFlyOnVideo,
  )

  useEffect(() => {
    return () => {
      updateEnableAR(false)
    }
  }, [])

  return (
    <div className="absolute inset-0  bg-black">
      <DeviceLiveVideo
        ref={deviceLiveVideoRef}
        deviceId={deviceId}
        productKey={productKey!}
        videoId={videoId}
        useDing={false}
        useVideoQualityCheck={{
          open: true,
          valueDRC: videoQuality ?? (useLW ? 'Unknown' : undefined),
          onDRCChange: liveSetQuality,
        }}
        onAspectRatioChange={(v) => {
          onAspectRatioChange?.(v)
        }}
        sn={isRtcDemo ? sn : undefined}
        onUavProperties={handlePropertiesSei}
        onClickSeiBox={handleSeiClick}
        rightBottom={
          <div className="order-first flex items-center gap-2">
            {hasShutterSet && (
              <Suspense fallback={null}>
                <ShutterValue />
              </Suspense>
            )}
            {hasExposureSet && (
              <Suspense fallback={null}>
                <ExposureValue />
              </Suspense>
            )}
            {hasExposureSet && <ExposureMode postSerivce={postDeviceService} />}
            {hasZoomFocusMode && (
              <ZoomFocusMode postSerivce={postDeviceService} />
            )}
          </div>
        }
        videoChildren={
          <>
            <LaserRanging />
            {/* {enableAR && <MixARCanvas />} */}
            {enableAR && (
              <div className="asolute inset-0">
                {/* <ARScene /> */}
                <ARSceneCesium />
              </div>
            )}
            {enableSmartTrack && <AITrackBoxSelect />}
            {irMeteringMode && irMeteringMode !== 'CLOSE' && <IrMetering />}
            <ZoomFocus />
            {posizionZoomOpen > 0 && (
              // <PositionZoom deviceLiveVideoRef={deviceLiveVideoRef} />
              <PointOrBoxSelect deviceLiveVideoRef={deviceLiveVideoRef} />
            )}
            {openTapToFlyOnVideo && <TapToFlyOnVideo />}
            <WarningAlerts />
          </>
        }
        videoSafeAreaChildren={
          <>
            <Avoidance />
          </>
        }
        onVideoElementChange={updateVideoElement}
      />
    </div>
  )
})

ControlRoomVideo.displayName = 'ControlRoomVideo'

export default ControlRoomVideo
