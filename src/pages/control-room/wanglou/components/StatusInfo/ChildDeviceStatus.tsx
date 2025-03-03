import { useWangLouControlRoomStore } from '@/store/context-store/useWangLouControlRoom.store'
import ChildDeviceStatusItem from './ChildDeviceStatusWrapper'

type PropsType = {
  data: API_DEVICE.domain.Device
}
const ChildDeviceStatus: React.FC<PropsType> = ({ data }) => {
  const state = useWangLouControlRoomStore((s) => s.state[data.deviceId])
  return <ChildDeviceStatusItem data={data} state={state} />
}

export default ChildDeviceStatus
