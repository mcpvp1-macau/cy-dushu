
import { useBackTrackingStore } from '@/store/context-store/useBackTracking.store'
import { shouldJson } from '@/utils/json'
import ChildDeviceStatusItem from '@/pages/control-room/wanglou/components/StatusInfo/ChildDeviceStatusWrapper'

const useChildDeviceInfo = (deviceId) => {
    const currentAttribute = useBackTrackingStore((s) => s.currentAttribute) || {}
    const state = useMemo(() => {
      const cur = currentAttribute
        ? shouldJson(currentAttribute?.properties || '{}')
        : {}
      return {
        ...(cur[deviceId] || {}),
      //   ...cur,
      }
    }, [currentAttribute])
    return state
}

type PropsType = {
  data: API_DEVICE.domain.Device
}
const ChildDeviceStatus: React.FC<PropsType> = ({ data }) => {
  const state = useChildDeviceInfo(data?.deviceId)
  return <ChildDeviceStatusItem data={data} state={state} />
}

export default ChildDeviceStatus
