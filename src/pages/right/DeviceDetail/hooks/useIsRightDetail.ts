import useRightMode from '@/store/layout/useRightMode.store'
import { useDeviceDetailStore } from './useDeviceDetail.store'
import { RightModeEnum } from '@/enum/right-mode'

const useIsRightDetail = () => {
  const deviceId = useDeviceDetailStore((s) => s.deviceId)
  const isDevice = useRightMode((s) => s.rightMode === RightModeEnum.DEVICE)
  const rightDetailId = useRightMode((s) => s.detailId)
  return isDevice && deviceId == rightDetailId
}

export default useIsRightDetail
