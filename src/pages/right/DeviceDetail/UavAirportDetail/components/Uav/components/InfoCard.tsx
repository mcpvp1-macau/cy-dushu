import { StatusColorMap } from '@/enum/device'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { useRealOnlineStatus } from '@/store/useGlobalWebSocket.store'

const I: FC<{ l: ReactNode; v: ReactNode }> = ({ l, v }) => {
  return (
    <li className="w-1/2 flex gap-1 whitespace-nowrap">
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
  const { t } = useTranslation()

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
    return taskStatus === 'RUNNING'
      ? t('device.status.task.RUNNING')
      : t('device.status.task.IDLE')
  }, [taskStatus])

  const reportedStatus = useMemo(
    () =>
      deviceDetail?.deviceTags?.find(
        (e: any) => 'FLIGHT_REPORTING_STATUS' === e.tagName,
      )?.tagValue === 'REPORTED'
        ? t('common.yes')
        : t('common.no'),
    [t, deviceDetail],
  )

  return (
    <ul className="flex card-border p-2 flex-wrap text-sm">
      <I l={t('common.modelNumber')} v={modelNumber || '-'} />
      <I
        l={t('common.onlineStatus')}
        v={
          <span style={{ color: StatusColorMap[onlineStatus] }}>
            {onlineStatus ? t(`device.status.online.${onlineStatus}`) : '-'}
          </span>
        }
      />
      <I l={t('device.status.task.title')} v={taskStatusText} />
      <I l={t('device.status.reported.title')} v={reportedStatus} />
    </ul>
  )
})

UavAirportUavDetailInfoCard.displayName = 'UavAirportUavDetailInfoCard'

export default UavAirportUavDetailInfoCard
