import { Button } from 'antd'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { usePostDeviceService } from '@/hooks/device/usePostDeviceService'

const FC30PD1: React.FC = () => {
  const serviceName = 'handleFC30ThrowAt'
  const valueName = 'fc30PayloadDropperStatus'
  const paramName = 'FC30throwType'
  const deviceModel = useDeviceDetailStore((s) => s.deviceDetail?.deviceModel)

  const productKey = useDeviceDetailStore(
    (s) =>
      s.deviceDetail?.productKey || s.deviceDetail?.deviceModel?.productKey,
  )!
  const deviceId = useUavControlRoomStore((s) => s.deviceId)
  const postSerivce = usePostDeviceService(productKey, deviceId)
  const _value = useUavControlRoomStore((s) => s.state?.[valueName])

  const getInputMethodField = (
    obj: API_DEVICE.domain.Service | undefined,
    identifier: string,
  ) => {
    if (!identifier) {
      return obj?.inputMethodFields?.[0]
    }
    return obj?.inputMethodFields?.find(
      (item) => item.identifier === identifier,
    )
  }

  const getSpecs = (serviceName: string, paramName?: string) => {
    const service = deviceModel?.services?.[serviceName]
    const param = getInputMethodField(service, paramName || '')
    const specs = param?.dataType?.specs || {}
    return { specs, name: param?.identifier }
  }

  const { specs, name } = getSpecs(serviceName, paramName)

  return (
    <div className="flex flex-wrap gap-2 pl-[12px] pr-[12px] mb-[12px] pt-[12px]">
      {/* <div>当前状态：{value}</div> */}

      {Object.keys(specs).length > 0 &&
        Object.keys(specs).map((key) => (
          <div key={key} className="">
            <Button
              onClick={() => postSerivce?.(serviceName, { [name!]: key })}
            >{`${specs[key as keyof typeof specs]}`}</Button>
          </div>
        ))}
    </div>
  )
}

export default FC30PD1
