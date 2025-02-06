import IconHome from '@/assets/icons/jsx/uav/IconHome'
import IconUavBattery from '@/assets/icons/jsx/uav/IconUavBattery'

type PropsType = {
  electric?: number
  horizontalSpeed?: number
  height?: number
  homeDistance?: number
}

/** 飞参卡片 */
const UavFlyInfoCard: FC<PropsType> = memo(
  ({ electric, horizontalSpeed, height, homeDistance }) => {
    return (
      <ul className="flex items-center text-sm">
        <li className="flex-1 flex gap-1 items-center">
          <div>
            <IconUavBattery className="text-green-500" />
          </div>
          <div>{electric ?? '-'} %</div>
        </li>
        <li className="flex-1 flex gap-1 items-center">
          <div>H.S</div>
          <div>{horizontalSpeed?.toFixed(1) ?? '-'} m/s</div>
        </li>
        <li className="flex-1 flex gap-1 items-center">
          <div>AGL</div>
          <div>{height?.toFixed(1) ?? '-'} m</div>
        </li>
        <li className="flex-1 flex gap-1 items-center">
          <div>
            <IconHome className="text-yellow-500" />
          </div>
          <div>{homeDistance?.toFixed(1) ?? '-'} m</div>
        </li>
      </ul>
    )
  },
)

UavFlyInfoCard.displayName = 'UavFlyInfoCard'

export default UavFlyInfoCard
