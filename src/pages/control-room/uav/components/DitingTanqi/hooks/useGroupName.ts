import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import useUserStore from '@/store/useUser.store'

const useGroupName = () => {
  const username = useUserStore((s) => s.user?.username)
  const deviceId = useDeviceDetailStore((s) => s.deviceId)
  const groupName = username && deviceId ? `ds-${username}-${deviceId}` : ''

  return groupName
}

export default useGroupName
