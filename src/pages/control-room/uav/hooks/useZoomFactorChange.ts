import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { limitNum } from '@/utils/math'
import { useDebounceEffect, useDebounceFn } from 'ahooks'
import { isNil } from 'lodash'

/** 用于控制变焦的 hooks 需要保证有 uavControlRoomStore 和 deviceDetail 的上下文 */
const useUavZoomFactorChange = () => {
  const zoomFactor = useUavControlRoomStore((s) => s.state.zoomFactor)
  const [value, _setValue] = useState(zoomFactor ?? 2)

  const sync = useRef(true)
  const { run: allowSync } = useDebounceFn(
    () => {
      sync.current = true
      if (!isNil(zoomFactor) && zoomFactor !== value) {
        _setValue(zoomFactor)
      }
    },
    { wait: 4000 },
  )

  useEffect(() => {
    if (!isNil(zoomFactor) && sync.current) {
      _setValue(zoomFactor)
    }
  }, [zoomFactor])

  /** 设置焦距值, 在设置之后 4s 内不会被受 ws 影响 */
  const setValue = useMemoizedFn<React.Dispatch<React.SetStateAction<number>>>(
    (v: number | ((v: number) => number)) => {
      sync.current = false
      if (typeof v === 'function') {
        _setValue((old) => limitNum(v(old), 2, 200))
      } else {
        _setValue(limitNum(v, 2, 200))
      }
      allowSync()
    },
  )

  const videoId = useDeviceDetailStore(
    (s) => s.deviceDetail?.properties?.videoList?.[0]?.videoId,
  )
  const deviceModel = useDeviceDetailStore((s) => s.deviceDetail?.deviceModel)
  const zoomfactor = useMemo(
    () =>
      deviceModel?.services?.liveZoomChange?.inputMethodFields?.find(
        (item: any) => item.identifier === 'zoomFactor',
      ),
    [deviceModel],
  )
  const sendCommand = useUavControlRoomStore((s) => s.sendCommand)
  useDebounceEffect(
    () => {
      if (!zoomfactor) {
        return
      }
      sendCommand('service.liveZoomChange.post', {
        videoId,
        [zoomfactor.identifier]: value,
      })
    },
    [value],
    { wait: 500 },
  )

  return [value, setValue] as const
}

export default useUavZoomFactorChange
