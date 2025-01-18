import { Tooltip, Typography } from 'antd'
import { useOthersControlRoomStore } from '@/store/context-store/useOthersControlRoom.store'

type PropsType = {
  data: API_DEVICE.domain.Device
}
const ChildDeviceStatus: React.FC<PropsType> = ({ data }) => {
  const { deviceModel } = data

  const state = useOthersControlRoomStore((s) => s.state[data.deviceId])
  const getDeviceInfo = useMemoizedFn(() => {
    const device = data
    return {
      ...(device?.properties || {}),
      status: device?.status,
      ...(state || {}),
    }
  })

  const infoList = useMemo(() => deviceModel.properties, [])
  const properties = useMemo(() => getDeviceInfo(), [deviceModel])

  return (
    <div className="flex flex-wrap p-[10px] gap-0">
      {infoList?.map(({ name, identifier }) => {
        const text = properties[identifier]
        if (identifier === 'videoList') return null
        // TODO 特性类型先不处理
        if (typeof text === 'object') return null
        return (
          <div className="w-1/2 flex" key={identifier}>
            <Tooltip title={name} placement="topLeft">
              <div className="text-[12px] w-[80px] text-right text-ellipsis overflow-hidden whitespace-nowrap">
                {`${name}${'：'}`}
              </div>
            </Tooltip>
            <Tooltip title={text} placement="topLeft">
              <Typography.Text
                style={{
                  flex: 1,
                  fontSize: 12,
                }}
                ellipsis
              >
                {text}
              </Typography.Text>
            </Tooltip>
          </div>
        )
      })}
    </div>
  )
}

export default ChildDeviceStatus
