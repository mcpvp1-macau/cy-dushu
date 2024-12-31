import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { limitNum } from '@/utils/math'
import { useDebounceEffect, useDebounceFn, useLatest } from 'ahooks'
import { isNil } from 'lodash'

/** 用于控制变焦的 hooks 需要保证有 uavControlRoomStore 和 deviceDetail 的上下文 */
const useUavZoomFactorChange = () => {
  const zoomFactor = useUavControlRoomStore((s) => s.state.zoomFactor)
  const [value, _setValue] = useState(zoomFactor ?? 2)
  const valueLatest = useLatest(value)

  // 同步来自 ws 的焦距值
  useDebounceEffect(
    () => {
      if (!isNil(zoomFactor) && zoomFactor !== value) {
        _setValue(zoomFactor)
      }
    },
    [zoomFactor],
    { wait: 1024 },
  )

  /** 设置焦距值, 在设置之后 4s 内不会被受 ws 影响 */
  const setValue = useMemoizedFn<React.Dispatch<React.SetStateAction<number>>>(
    (v: number | ((v: number) => number)) => {
      if (typeof v === 'function') {
        _setValue((old) => limitNum(v(old), 2, 200))
      } else {
        _setValue(limitNum(v, 2, 200))
      }
      sendZoomFactorValue()
    },
  )

  // 变焦功能物模型
  const deviceModel = useDeviceDetailStore((s) => s.deviceDetail?.deviceModel)
  const zoomfactor = useMemo(
    () =>
      deviceModel?.services?.liveZoomChange?.inputMethodFields?.find(
        (item: any) => item.identifier === 'zoomFactor',
      ),
    [deviceModel],
  )

  const sendCommand = useUavControlRoomStore((s) => s.sendCommand)
  const videoId = useDeviceDetailStore(
    (s) => s.deviceDetail?.properties?.videoList?.[0]?.videoId,
  )
  const { run: sendZoomFactorValue } = useDebounceFn(
    () => {
      sendCommand('service.liveZoomChange.post', {
        videoId,
        zoomFactor: valueLatest.current,
      })
    },
    { wait: 500 },
  )

  return [value, setValue] as const
}

export default useUavZoomFactorChange
