import DeviceOnlineStatus from '@/components/device/OnlineStatus'
import { useRealOnlineStatus } from '@/store/useGlobalWebSocket.store'
import { useOthersControlRoomStore } from '@/store/context-store/useOthersControlRoom.store'
import { useShallow } from 'zustand/react/shallow'
import { pick } from 'lodash'
import cn from 'clsx'
import { Tooltip } from 'antd'

const I: FC<{ l: ReactNode; v: ReactNode; inline?: boolean }> = ({ l, v, inline }) => {
  return (
    <li className={cn("flex gap-1 leading-5 text-[#C7D1DC]  text-[12px]", inline ? 'w-full' : 'w-1/2')}>
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

type PropsType = {
  modelNumber: string
  deviceDetail: API_DEVICE.domain.Device
}

const CameraDetailInfoCard: FC<PropsType> = memo(
  ({ deviceDetail, modelNumber }) => {
    const { t } = useTranslation()
    const { properties, deviceModel } = deviceDetail || {}
    const status = useRealOnlineStatus(deviceDetail.deviceId)
    const propertiesList = deviceModel?.properties ?? []
    const propertiesMap = propertiesList.reduce((acc, item) => {
      acc[item.identifier] = item
      return acc
    }, {})
    const renderItemValue = (identifier: string, value: any) => {
      const pItem = propertiesMap[identifier]
      if (value === undefined) {
        return '-'
      }
      if (pItem) {
        const dataType = pItem.dataType
        const type = dataType.type
        if (type === 'double' || type === 'float') {
          if (dataType.specs.unitName) {
            return `${Number(value)?.toFixed(5)} ${dataType.specs.unitName}`
          }
          return Number(value)?.toFixed(5)
        }
        if (type === 'int') {
          if (dataType.specs.unitName) {
            return `${Number(value)} ${dataType.specs.unitName}`
          }
          return Number(value)
        }
        if (type === 'bool') {
          return dataType.specs[value]
        }

        if (type === 'enum') {
          return dataType.specs[value]
        }
        return JSON.stringify(value)
      }
      return '-'
    }
    let {
      longitude,
      latitude,
      altitude,
      ISMStatus,
      navigationIFState,
      fullFrequencyIFStatus,
      navigationDecoyState,
      taskNumber,
      taskStatusType,
      openTime,
      endTime,
    } = properties ?? {}

    const state = useOthersControlRoomStore(
      useShallow((m) => {
        const s = m.state
        return pick(s, [
          'longitude',
          'latitude',
          'altitude',
          'ISMStatus',
          'navigationIFState',
          'fullFrequencyIFStatus',
          'navigationDecoyState',
          'taskNumber',
          'taskStatusType',
          'openTime',
          'endTime',
        ])
      }),
    )
    longitude = state.longitude ?? longitude
    latitude = state.latitude ?? latitude
    altitude = state.altitude ?? altitude
    taskNumber = state.taskNumber ?? taskNumber
    ISMStatus = state.ISMStatus ?? ISMStatus
    navigationIFState = state.navigationIFState ?? navigationIFState
    fullFrequencyIFStatus = state.fullFrequencyIFStatus ?? fullFrequencyIFStatus
    navigationDecoyState = state.navigationDecoyState ?? navigationDecoyState
    taskStatusType = state.taskStatusType ?? taskStatusType
    openTime = state.openTime ?? openTime
    endTime = state.endTime ?? endTime
    return (
      <ul className="flex flex-wrap text-sm card-border p-3">
        <I l={'设备型号'} v={modelNumber || '-'} />
        <I
          l={t('common.onlineStatus')}
          v={<DeviceOnlineStatus status={status} />}
        />
        <I l={'设备经度'} v={renderItemValue('longitude', longitude) ?? '-'} />
        <I l={'设备纬度'} v={renderItemValue('latitude', latitude) ?? '-'} />
        <I l={'设备高度'} v={renderItemValue('altitude', altitude) ?? '-'} />
        <I l={'任务编号'} v={renderItemValue('taskNumber', taskNumber) ?? '-'} />
        <I l={'任务类型'} v={renderItemValue('taskStatusType', taskStatusType) ?? '-'} />
        <I l={'ISM状态'} v={renderItemValue('ISMStatus', ISMStatus) ?? '-'} />
        <I l={'全频干扰'} v={renderItemValue('fullFrequencyIFStatus', fullFrequencyIFStatus)   ?? '-'} />
        <I l={'导航干扰'} v={renderItemValue('navigationIFState', navigationIFState) ?? '-'} />
        <I l={'导航诱骗'} v={renderItemValue('navigationDecoyState', navigationDecoyState) ?? '-'} />
        <I l={'任务开始时间'} v={openTime ? dayjs(openTime * 1000).format('YYYY-MM-DD HH:mm:ss') : '-'} inline />
        <I l={'任务结束时间'} v={endTime ? dayjs(endTime * 1000).format('YYYY-MM-DD HH:mm:ss') : '-'} inline />
      </ul>
    )
  },
)

CameraDetailInfoCard.displayName = 'CameraDetailInfoCard'

export default CameraDetailInfoCard
