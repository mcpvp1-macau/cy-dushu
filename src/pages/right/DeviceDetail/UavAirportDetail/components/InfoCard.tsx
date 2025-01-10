import { StatusColorMap } from '@/enum/device'
import { memo, type FC } from 'react'

type PropsType = {
  modelNumber: string
  onlineStatus: string
  modeDisplay: string
  stockStatus: number
}

const I: FC<{ l: ReactNode; v: ReactNode }> = ({ l, v }) => {
  return (
    <li className="w-1/2 flex gap-1">
      <div>{l}:</div>
      {v}
    </li>
  )
}

/** 信息卡片 */
const UavAirportInfoCard: FC<PropsType> = memo((props) => {
  const { t } = useTranslation()
  const stockStatus = useMemo(() => {
    if (props.stockStatus === undefined) {
      return '-'
    }
    return props.stockStatus === 1
      ? t('device.uavDock.status.inDock.title')
      : t('device.uavDock.status.outDock.title')
  }, [props.stockStatus, t])

  return (
    <ul className="card-border p-2 flex flex-wrap whitespace-nowrap text-sm">
      <I l={t('common.modelNumber')} v={props.modelNumber || '-'} />
      <I
        l={t('common.onlineStatus')}
        v={
          <span style={{ color: StatusColorMap[props.onlineStatus] }}>
            {props.onlineStatus
              ? t(`device.status.online.${props.onlineStatus}`)
              : '-'}
          </span>
        }
      />
      <I
        l={t('device.uavDock.status.modeDisplay.title')}
        v={props.modeDisplay || '-'}
      />
      <I l={t('device.uavDock.status.dockStatus.title')} v={stockStatus} />
    </ul>
  )
})

UavAirportInfoCard.displayName = 'UavAirportInfoCard'

export default UavAirportInfoCard
