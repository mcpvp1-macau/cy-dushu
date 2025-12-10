import DeviceOnlineStatus from '@/components/device/OnlineStatus'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { useRealOnlineStatus } from '@/store/useGlobalWebSocket.store'
import {FC, memo} from 'react'
import { useTranslation } from 'react-i18next'
// import { pick } from 'lodash'
// import { useShallow } from 'zustand/react/shallow'
// import { useOthersControlRoomStore } from '@/store/context-store/useOthersControlRoom.store'
import InfoItem, { I } from './InfoItem'

// const I: FC<{ l: ReactNode; v: ReactNode }> = ({ l, v }) => {
//   return (
//     <li className="w-1/2 flex gap-1 text-sm items-center">
//       <div className="text-xs text-fore">{l}:</div>
//       {v}
//     </li>
//   )
// }

type PropsType = Record<string, never>

const StatusInfo: FC<PropsType> = memo(() => {
  const { t } = useTranslation()
  const deviceDetail = useDeviceDetailStore((s) => s.deviceDetail)
  // const { properties, deviceModel } = deviceDetail
  const status = useRealOnlineStatus(deviceDetail?.deviceId || '')
//   const state = useOthersControlRoomStore(
//     useShallow((s) => {
//       return pick(s.state, ['longitude', 'latitude', 'altitude', 'workMode', 'laserDeviceWorkingStatus'])
//     }),
//   )
  const modelName =
    deviceDetail?.deviceTags?.find(
      (item: { tagName: string }) => item.tagName === 'MODEL_NUMBER',
    )?.tagValue || '-'

//   const longitude = state.longitude ?? properties.longitude
//   const latitude = state.latitude ?? properties.latitude
//   const altitude = state.altitude ?? properties.altitude
//   const workMode = state.workMode ?? properties.workMode
//   const laserDeviceWorkingStatus = state.laserDeviceWorkingStatus ?? properties.laserDeviceWorkingStatus

  console.log('====',status)

  return (
    <ul className="flex flex-wrap text-sm card-border px-1 p-1 bg-[#28323C] m-2">
      <I l={'设备型号'} v={modelName || '-'} />
      <I
        l={t('common.onlineStatus')}
        v={<DeviceOnlineStatus status={status} />}
      />
      <InfoItem name="longitude" label="设备经度" />
      <InfoItem name="latitude" label="设备纬度" />
      <InfoItem name="altitude" label="设备高度" />
      <InfoItem name="workMode" label="工作模式" />
      <InfoItem name="laserDeviceWorkingStatus" label="工作状态" />
      {/* <I l={'设备经度'} v={longitude ?? '-'} />
      <I l={'设备纬度'} v={latitude ?? '-'} />
      <I l={'设备高度'} v={altitude ?? '-'} />
      <I l={'工作模式'} v={workMode ?? '-'} />
      <I l={'工作状态'} v={laserDeviceWorkingStatus ?? '-'} /> */}

    </ul>
  )
})

StatusInfo.displayName = 'StatusInfo'

export default StatusInfo
