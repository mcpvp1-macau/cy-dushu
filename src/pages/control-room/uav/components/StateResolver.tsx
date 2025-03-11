import useCollectHistoryPath from '../hooks/useCollectHisotryPath'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'

type PropsType = unknown

/** 状态处理相关 */
const StateResolver: FC<PropsType> = memo(() => {
  useCollectHistoryPath(64)

  const properties = useDeviceDetailStore((s) => s.deviceDetail?.properties)
  const updateState = useUavControlRoomStore((s) => s.updateState)
  useEffect(() => {
    if (properties) {
      updateState(properties)
    }
  }, [properties])

  return null
})

StateResolver.displayName = 'StateResolver'

export default StateResolver
