import { shouldJson } from '@/utils/json'
import { Tooltip } from 'antd'

const I: FC<{ l: ReactNode; v: ReactNode }> = ({ l, v }) => {
  return (
    <li className="w-1/2 flex gap-1 leading-5  text-[12px]">
      <Tooltip title={l}>
        <div className="truncate w-[60px]">{l}</div>
      </Tooltip>
      <div>:</div>
      {v === undefined ? '-' : v}
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
  deviceId: string
  data: string
  device: API_DEVICE.domain.Device
}

const InfoCardItem: React.FC<PropsType> = memo(({ deviceId, data, device }) => {
  const values = data ? shouldJson(data) : {}
  const modelName =
    device.deviceTags?.find(
      (item: { tagName: string }) => item.tagName === 'MODEL_NUMBER',
    )?.tagValue || '-'
  //   const status = useRealOnlineStatus(data.deviceId)
  const state = values
  const { properties, deviceModel } = device

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

    return <I key={item.name} l={item.name} v={value} />
  }

  const render = (item: API_DEVICE.domain.Propertie) => {
    const { dataType, identifier } = item
    if (dataType.type === 'struct') {
      return <>{dataType.specs?.map((item) => renderItem(item, identifier))}</>
    } else {
      return renderItem(item)
    }
  }

  const { t } = useTranslation()
  return (
    <div >
      <ul  className="py-[10px] text-sm flex flex-wrap">
        <I l={t('resource.table.deviceModel.title')} v={modelName} />
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

export default InfoCardItem
