import OverflowText from '@/components/ui/OverflowText'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { useSmartCarControlRoomStore } from '@/store/context-store/useSmartCarControlRoom.store'

type InfoItem = {
  label: string
  value?: ReactNode
  isFull?: boolean
}

const InfoItemRow: FC<InfoItem> = ({ label, value, isFull = false }) => {
  return (
    <li className={clsx('flex gap-1 overflow-hidden', isFull && 'col-span-2')}>
      <div className="whitespace-nowrap">{label}:</div>
      <OverflowText className="flex-1 truncate">{value ?? '-'}</OverflowText>
    </li>
  )
}

const formatCoordinate = (value?: number) => {
  if (typeof value !== 'number') {
    return '-'
  }

  return value.toFixed(6)
}

/** 智慧警车信息卡片 */
const SmartCarInfoCard: FC = memo(() => {
  const { t } = useTranslation()

  const deviceTags = useDeviceDetailStore((s) => s.deviceDetail?.deviceTags)

  const reportTime = useSmartCarControlRoomStore(
    (s) => (s.state as { updateTime?: string })?.updateTime,
  )
  const longitude = useSmartCarControlRoomStore((s) => s.state.longitude)
  const latitude = useSmartCarControlRoomStore((s) => s.state.latitude)

  const { modelNumber, plateType, plateNumber } = useMemo(() => {
    const tagsMap = new Map<string, string | undefined>()
    deviceTags?.forEach((item) => {
      if (item?.tagName) {
        tagsMap.set(item.tagName, item.tagValue)
      }
    })

    return {
      // 业务规则：型号信息存放在设备标签中。
      modelNumber: tagsMap.get('MODEL_NUMBER') ?? '-',
      // 业务规则：号牌信息使用设备标签映射。
      plateType: tagsMap.get('PLATE_TYPE') ?? tagsMap.get('CARD_TYPE') ?? '-',
      plateNumber:
        tagsMap.get('PLATE_NUMBER') ?? tagsMap.get('CARD_NUMBER') ?? '-',
    }
  }, [deviceTags])

  const infoItems = useMemo<InfoItem[]>(
    () => [
      {
        label: t('smartCar.info.deviceCode', { defaultValue: '设备编号' }),
        value: modelNumber,
      },
      {
        label: t('smartCar.info.reportTime', { defaultValue: '上报时间' }),
        value: reportTime ?? '-',
      },
      {
        label: t('smartCar.info.plateType', { defaultValue: '号牌种类' }),
        value: plateType,
      },
      {
        label: t('smartCar.info.plateNumber', { defaultValue: '号牌号码' }),
        value: plateNumber,
      },
      {
        label: t('smartCar.info.longitude', { defaultValue: '经度' }),
        value: formatCoordinate(longitude),
      },
      {
        label: t('smartCar.info.latitude', { defaultValue: '纬度' }),
        value: formatCoordinate(latitude),
      },
    ],
    [latitude, longitude, modelNumber, plateNumber, plateType, reportTime, t],
  )

  return (
    <ul className="p-2 mx-3 card-border text-sm grid grid-cols-2 overflow-hidden gap-y-1">
      {infoItems.map((item) => (
        <InfoItemRow
          key={item.label}
          label={item.label}
          value={item.value}
          isFull={item.isFull}
        />
      ))}
    </ul>
  )
})

SmartCarInfoCard.displayName = 'SmartCarInfoCard'

export default SmartCarInfoCard
