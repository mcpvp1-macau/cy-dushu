import OverflowText from '@/components/ui/OverflowText'
import { dockDisplayModeTransMap } from '@/constant/trans_map/dock_display_mode'
import { StatusColorMap } from '@/enum/device'

type PropsType = {
  modelNumber: string
  onlineStatus: string
  modeDisplay: string
  stockStatus: number
}

const I: FC<{ l: ReactNode; v: ReactNode }> = ({ l, v }) => {
  return (
    <li className="flex gap-1 overflow-hidden">
      <div className="whitespace-nowrap">{l}:</div>
      {v}
    </li>
  )
}

/** 信息卡片 */
const UavAirportInfoCard: FC<PropsType> = memo((props) => {
  const { t, i18n } = useTranslation()
  const stockStatus = useMemo(() => {
    if (props.stockStatus === undefined) {
      return '-'
    }
    return props.stockStatus === 1
      ? t('device.uavDock.status.inDock.title')
      : t('device.uavDock.status.outDock.title')
  }, [props.stockStatus, t])

  return (
    <ul className="card-border border-ground-5 p-2 grid grid-cols-2 text-sm">
      <I
        l={t('common.modelNumber')}
        v={
          <OverflowText className="flex-1 truncate">
            {props.modelNumber || '-'}
          </OverflowText>
        }
      />
      <I
        l={t('common.onlineStatus')}
        v={
          <OverflowText className="truncate">
            <span style={{ color: StatusColorMap[props.onlineStatus] }}>
              {props.onlineStatus
                ? t(`device.status.online.${props.onlineStatus}`)
                : '-'}
            </span>
          </OverflowText>
        }
      />
      <I
        l={t('device.uavDock.status.modeDisplay.title')}
        v={
          <OverflowText className="flex-1 truncate">
            {props.modeDisplay
              ? dockDisplayModeTransMap[props.modeDisplay]?.[i18n.language] ||
                props.modeDisplay
              : '-'}
          </OverflowText>
        }
      />
      <I
        l={t('device.uavDock.status.dockStatus.title')}
        v={<OverflowText className="flex-1 truncate">{stockStatus}</OverflowText>}
      />
    </ul>
  )
})

UavAirportInfoCard.displayName = 'UavAirportInfoCard'

export default UavAirportInfoCard
