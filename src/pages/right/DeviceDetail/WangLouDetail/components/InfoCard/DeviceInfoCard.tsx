import { StatusColorMap } from '@/enum/device'
import { useWangLouControlRoomStore } from '@/store/context-store/useWangLouControlRoom.store'
import { useRealOnlineStatus } from '@/store/useGlobalWebSocket.store'
import { Tooltip } from 'antd'
import { ReactNode } from 'react'

const I: FC<{ l: ReactNode; v: ReactNode }> = ({ l, v }) => {
  return (
    <li className="w-1/2 flex gap-1 leading-5  text-[12px]">
      <Tooltip title={l}>
        <div className="truncate w-[60px]">{l}</div>
      </Tooltip>
      <div>:</div>
      <span className="text-[#fff] text-[14px]">
        {v === undefined ? '-' : v}
      </span>
    </li>
  )
}

const T: FC<{ l: ReactNode }> = ({ l }) => {
  return (
    <li className="w-[100%] leading-5 text-[12px]">
      <Tooltip title={l}>
        <div className="truncate w-[60px]">{l}</div>
      </Tooltip>
    </li>
  )
}

type PropsType = {
  data: API_DEVICE.domain.Device
  deviceId: string
}

const DeviceInfoCard: FC<PropsType> = memo(({ data, deviceId }) => {
  const modelName =
    data.deviceTags?.find(
      (item: { tagName: string }) => item.tagName === 'MODEL_NUMBER',
    )?.tagValue || '-'
  const status = useRealOnlineStatus(data.deviceId)
  const state = useWangLouControlRoomStore((s) => s.state[deviceId]) || {}
  const { properties, deviceModel } = data

  const renderItem = (item, parentIdentifier = '') => {
    let value: any = null
    const type =
      item.type ?? (item?.dataType?.type as API_DEVICE.domain.DataType['type'])
    if (parentIdentifier) {
      value =
        state[parentIdentifier]?.[item.identifier] ??
        properties[parentIdentifier]?.[item.identifier]
    } else {
      value = state?.[item.identifier] ?? properties?.[item.identifier]
    }
    if (type === 'bool') {
      value = item.specs?.[value!]
    } else if (type === 'enum') {
      value = item.specs?.[value!]
    } else if (type === 'double' || type === 'float') {
      value = value === undefined ? '-' : Number(value)?.toFixed(5)
    }

    return <I l={item.name} v={value} />
  }

  const render = (item: API_DEVICE.domain.Propertie) => {
    const { dataType, identifier } = item
    if (dataType.type === 'struct') {
      return (
        <>
          <T l={item.name} />
          <div className="p-[8px] border-[1px] border-[rgba(255,255,255,0.2)] text-sm flex flex-wrap">
            {dataType.specs?.map((item) => renderItem(item, identifier))}
          </div>
        </>
      )
    } else {
      return renderItem(item)
    }
  }

  const { t } = useTranslation()

  return (
    <div>
      <ul className="py-[10px] text-sm flex flex-wrap">
        <I l={t('resource.table.deviceModel.title')} v={modelName} />
        <I
          l={t('common.onlineStatus')}
          v={
            <p className="flex gap-2">
              <span style={{ color: StatusColorMap[status!] }}>
                {t(`device.status.online.${status}`) || '-'}
              </span>
            </p>
          }
        />
        {deviceModel?.properties
          ?.filter(
            (item) =>
              item.identifier !== 'videoList' &&
              item.identifier !== 'scanRangeProfile',
          )
          .map(render)}
      </ul>
    </div>
  )
})

DeviceInfoCard.displayName = 'DeviceInfoCard'

export default DeviceInfoCard
