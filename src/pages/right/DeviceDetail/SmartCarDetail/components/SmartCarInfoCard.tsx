import OverflowText from '@/components/ui/OverflowText'

type MockSmartCarInfo = {
  deviceCode?: string
  reportTime?: string
  plateType?: string
  plateNumber?: string
  longitude?: number
  latitude?: number
}

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

  const mockInfo = useMemo<MockSmartCarInfo>(
    () => ({
      // 业务规则：接口暂无数据，先用 mock 信息占位展示。
      deviceCode: 'SMART-CAR-001',
      reportTime: '2024-08-20 14:35:20',
      plateType: '小型汽车',
      plateNumber: '浙A12345',
      longitude: 120.1551,
      latitude: 30.2741,
    }),
    [],
  )

  const infoItems = useMemo<InfoItem[]>(
    () => [
      {
        label: t('smartCar.info.deviceCode', { defaultValue: '设备编号' }),
        value: mockInfo.deviceCode,
      },
      {
        label: t('smartCar.info.reportTime', { defaultValue: '上报时间' }),
        value: mockInfo.reportTime,
      },
      {
        label: t('smartCar.info.plateType', { defaultValue: '号牌种类' }),
        value: mockInfo.plateType,
      },
      {
        label: t('smartCar.info.plateNumber', { defaultValue: '号牌号码' }),
        value: mockInfo.plateNumber,
      },
      {
        label: t('smartCar.info.longitude', { defaultValue: '经度' }),
        value: formatCoordinate(mockInfo.longitude),
      },
      {
        label: t('smartCar.info.latitude', { defaultValue: '纬度' }),
        value: formatCoordinate(mockInfo.latitude),
      },
    ],
    [mockInfo, t],
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
