import { createDeviceOverlay } from '@/service/modules/device-zone'
import { createFlightArea } from '@/service/modules/flightArea'
import { createOverlay } from '@/service/modules/layer_overlay'
import useMapDrawStore from '@/store/map/useDraw.store'

const useCreateFn = () => {
  const isFlightArea = useMapDrawStore((s) => s.isFlightArea)
  const isDrawingDeviceArea = useMapDrawStore((s) => s.isDrawingDeviceArea)
  const bindDeviceId = useMapDrawStore((s) => s.bindingDeviceId)

  const createFn = useMemo(() => {
    if (isFlightArea) {
      return createFlightArea
    }
    if (isDrawingDeviceArea) {
      return (data: any) => {
        return createDeviceOverlay({ ...data, deviceId: bindDeviceId }) // 绑定设备ID
      }
    } else {
      return createOverlay
    }
  }, [isFlightArea, isDrawingDeviceArea])

  return createFn
}

export default useCreateFn
