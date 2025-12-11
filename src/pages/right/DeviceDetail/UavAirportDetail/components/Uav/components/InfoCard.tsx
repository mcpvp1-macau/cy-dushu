import OverflowText from '@/components/ui/OverflowText'
import { StatusColorMap } from '@/enum/device'
import TaskStatusQuickCreate from '@/pages/right/DeviceDetail/components/TaskStatusQuickCreate'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { useRealOnlineStatus } from '@/store/useGlobalWebSocket.store'

const I: FC<{ l: ReactNode; v: ReactNode }> = ({ l, v }) => {
  return (
    <li className="flex gap-1 overflow-hidden">
      <div className="whitespace-nowrap">{l}:</div>
      {v}
    </li>
  )
}

/** 信息卡片 */
const UavAirportUavDetailInfoCard: FC = memo(() => {
  const { t } = useTranslation()

  const deviceDetail = useDeviceDetailStore((s) => s.deviceDetail)!

  const modelNumber = useMemo(
    () =>
      deviceDetail?.deviceTags?.find((e) => e.tagName === 'MODEL_NUMBER')
        ?.tagValue,
    [deviceDetail],
  )

  const onlineStatus = useRealOnlineStatus(deviceDetail.deviceId)

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
    <ul className="card-border p-2 grid grid-cols-2 text-sm">
      <I
        l={t('common.modelNumber')}
        v={
          <OverflowText className="flex-1 truncate">
            {modelNumber || '-'}
          </OverflowText>
        }
      />
      <I
        l={t('common.onlineStatus')}
        v={
          <OverflowText className="truncate">
            <span style={{ color: StatusColorMap[onlineStatus] }}>
              {onlineStatus ? t(`device.status.online.${onlineStatus}`) : '-'}
            </span>
          </OverflowText>
        }
      />
      <I
        l={t('device.status.task.title')}
        v={<TaskStatusQuickCreate deviceId={deviceDetail.deviceId} />}
      />
      <I
        l={t('device.status.reported.title')}
        v={
          <OverflowText className="flex-1 truncate">{reportedStatus}</OverflowText>
        }
      />
    </ul>
  )
})

UavAirportUavDetailInfoCard.displayName = 'UavAirportUavDetailInfoCard'

export default UavAirportUavDetailInfoCard
