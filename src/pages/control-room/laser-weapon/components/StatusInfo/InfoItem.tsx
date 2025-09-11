import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { useOthersControlRoomStore } from '@/store/context-store/useOthersControlRoom.store'
import { FC, ReactNode } from 'react'

export const I: FC<{ l: ReactNode; v: ReactNode }> = ({ l, v }) => {
  return (
    <li className="w-1/2 flex gap-1 text-sm items-center text-white">
      <div className="text-xs text-fore">{l}:</div>
      {v}
    </li>
  )
}

type PropsType = {
  name: string
  label: string
  defaultValue?: string
  value?: any
  /** 使用specs */
  specs?: any
}

const InfoItem: React.FC<PropsType> = ({
  name,
  label,
  defaultValue = '-',
  value,
  specs,
}) => {
  const deviceDetail = useDeviceDetailStore((s) => s.deviceDetail)!
  const { properties, deviceModel } = deviceDetail
  const currentValue = useOthersControlRoomStore((s) => s.state[name])

  const newvalue = specs ? value : currentValue ?? properties[name]

  const modelItem = useMemo(
    () => deviceModel?.properties?.find((item) => item.identifier === name),
    [deviceModel, name],
  )

  const renderItemValue = useMemo(() => {
    if (newvalue === undefined) {
      return defaultValue
    }
    if (modelItem || specs) {
      const dataType = specs || modelItem?.dataType;
      const type = dataType.type
      if (type === 'double' || type === 'float') {
        if (dataType.specs.unitName) {
          return `${Number(newvalue)?.toFixed(5)} ${dataType.specs.unitName}`
        }
        return Number(newvalue)?.toFixed(5)
      }
      if (type === 'int') {
        if (dataType.specs.unitName) {
          return `${Number(newvalue)} ${dataType.specs.unitName}`
        }
        return Number(newvalue)
      }
      if (type === 'bool') {
        return dataType.specs[newvalue]
      }

      if (type === 'enum') {
        return dataType.specs[newvalue]
      }
      return JSON.stringify(newvalue)
    }
    return defaultValue
  }, [modelItem, newvalue])

  return <I l={label} v={renderItemValue} />
}

export default InfoItem
