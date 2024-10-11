import { StatusColorMap, StatusMap } from '@/enum/device'
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
  const stockStatus = useMemo(() => {
    if (props.stockStatus === undefined) {
      return '-'
    }
    return props.stockStatus === 1 ? '在舱' : '离舱'
  }, [props.stockStatus])

  return (
    <ul className="card-border p-2 flex flex-wrap whitespace-nowrap text-sm">
      <I l="设备型号" v={props.modelNumber || '-'} />
      <I
        l="在线状态"
        v={
          <span style={{ color: StatusColorMap[props.onlineStatus] }}>
            {StatusMap[props.onlineStatus] || '-'}
          </span>
        }
      />
      <I l="工作状态" v={props.modeDisplay || '-'} />
      <I l="在舱状态" v={stockStatus} />
    </ul>
  )
})

UavAirportInfoCard.displayName = 'UavAirportInfoCard'

export default UavAirportInfoCard
