import { flatMapDeep } from 'lodash'

/** 扁平化设备及其子设备 */
const useDeviceChildrenList = (
  deviceDetail?: API_DEVICE.domain.Device | null,
) => {
  const deviceList = useMemo(() => {
    if (!deviceDetail) {
      return []
    }
    return flatMapDeep([deviceDetail], (e) => [e, ...(e.childDevice ?? [])])
  }, [deviceDetail])
  return deviceList
}

export default useDeviceChildrenList
