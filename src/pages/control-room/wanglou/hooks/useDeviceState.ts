import { useMemoizedFn } from 'ahooks'
import {
  WANGLOUTargetName as Name,
  WanglouDeviceTypeMap as TypeMap,
  wanglouDeviceInfo,
} from '../components/StatusInfo/config'
import { useMemo } from 'react'

const useDeviceState = (data: any, state: any, name: Name) => {
  const { childDevice } = data || {}
  const getDeviceInfo = useMemoizedFn((targetName: Name) => {
    const device =
      targetName === Name.Turntable
        ? data
        : childDevice?.find((item: any) => item.productKey === TypeMap[name])
    return {
      ...(device?.properties || {}),
      status: device?.status,
      ...(state[device?.deviceId] || {}),
    }
  })
  const dianchiData = useMemo(
    () => childDevice?.find((item: any) => item.productKey === TypeMap[name]),
    [childDevice],
  )

  const dianchiState = useMemo(
    () => state[dianchiData?.deviceId],
    [state, dianchiData?.deviceId],
  )
  const infoList = useMemo(() => wanglouDeviceInfo[name], [])
  const properties = useMemo(() => getDeviceInfo(name), [dianchiState])

  return [infoList, properties]
}

export default useDeviceState
