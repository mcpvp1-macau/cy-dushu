import { StatusColorMap, StatusMap } from '@/enum/device'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { useRealOnlineStatus } from '@/store/useGlobalWebSocket.store'
import { memo, type FC } from 'react'

const I: FC<{ l: ReactNode; v: ReactNode }> = ({ l, v }) => {
  return (
    <li className="w-1/2 flex gap-1">
      <div>{l}:</div>
      {v}
    </li>
  )
}

type PropsType = {
  taskStatus?: string
}

/** 信息卡片 */
const UavAirportUavDetailInfoCard: FC<PropsType> = memo(({ taskStatus }) => {
  const deviceDetail = useDeviceDetailStore((s) => s.deviceDetail)!

  const modelNumber = useMemo(
    () =>
      deviceDetail?.deviceTags?.find((e) => e.tagName === 'MODEL_NUMBER')
        ?.tagValue,
    [deviceDetail],
  )

  const onlineStatus = useRealOnlineStatus(deviceDetail.deviceId)

  const taskStatusText = useMemo(() => {
    if (!taskStatus) {
      return '-'
    }
    return taskStatus === 'RUNNING' ? '任务中' : '无任务'
  }, [taskStatus])

  const reportedStatus = useMemo(
    () =>
      deviceDetail?.deviceTags?.find(
        (e: any) => 'FLIGHT_REPORTING_STATUS' === e.tagName,
      )?.tagValue === 'REPORTED'
        ? '已报备'
        : '未报备',
    [deviceDetail],
  )

  return (
    <ul className="flex card-border p-2 flex-wrap text-sm">
      <I l="设备型号" v={modelNumber || '-'} />
      <I
        l="在线状态"
        v={
          <span style={{ color: StatusColorMap[onlineStatus] }}>
            {StatusMap[onlineStatus]}
          </span>
        }
      />
      <I l="任务状态" v={taskStatusText} />
      <I l="报备状态" v={reportedStatus} />
    </ul>
  )
})

UavAirportUavDetailInfoCard.displayName = 'UavAirportUavDetailInfoCard'

export default UavAirportUavDetailInfoCard
