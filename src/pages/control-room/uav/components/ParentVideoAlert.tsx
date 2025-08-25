import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { getDeviceDetail } from '@/service/modules/device'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import useFixedWindowsStore from '@/store/useFixedWindows.store'

type PropsType = unknown

/** 父设备视频弹窗 */
const ParentVideoAlert: FC<PropsType> = memo(() => {
  const deviceDetail = useDeviceDetailStore((s) => s.deviceDetail)

  const modeCode = useUavControlRoomStore((s) => s.state.modeCode)
  const videoWindowId = useRef<string | null>(null)

  const addParentVideo = useMemoizedFn(async () => {
    if (!deviceDetail?.parentId) {
      return
    }
    const { data } = await getDeviceDetail(deviceDetail.parentId)
    const productKey = data.productKey || data.deviceModel!.productKey
    const deviceId = data.deviceId
    const videoId = data?.properties.videoList?.[0]?.videoId ?? ''

    const sto = useFixedWindowsStore.getState()

    const have = sto.windows.some((w) => {
      if (
        w.params.type === 'live-video' &&
        (w.params as any).deviceId === deviceId &&
        (w.params as any).videoId === videoId
      ) {
        videoWindowId.current = w.id
        return true
      }
      return false
    })

    if (have) {
      return
    }

    const id = sto.addWindow({
      params: {
        type: 'live-video',
        productKey,
        deviceId,
        videoId,
      },
      allowScale: true,
      layout: {
        x: 52,
        y: document.body.clientHeight - 257 - 36,
        width: 400,
        height: 257,
      },
    })
    videoWindowId.current = id
  })

  useEffect(() => {
    if (![1, 10].includes(modeCode)) {
      if (videoWindowId.current) {
        useFixedWindowsStore.getState().removeWindow(videoWindowId.current)
        videoWindowId.current = null
      }
      return
    }
    addParentVideo()
  }, [modeCode])

  return null
})

ParentVideoAlert.displayName = 'ParentVideoAlert'

export default ParentVideoAlert
