import useAirlineConfigStore from '@/store/uav/uav-airline/useAirlineConfig.store'
import XCard from '@/components/ui/XCard'
import IconTakeoff from '@/assets/icons/jsx/uav/IconTakeoff'
import { Button } from 'antd'

type PropsType = unknown

/** 参考起飞点设置 */
const TakeOffPointConfig: FC<PropsType> = () => {
  const takeOffRefPoint = useAirlineConfigStore(
    (s) => s.airlineConfig.takeOffRefPoint,
  )
  const setIsDrawHome = useAirlineConfigStore((s) => s.updateIsDrawHome)

  return (
    <XCard
      title={takeOffRefPoint ? '已设置参考起飞点' : '未设置起飞点'}
      topRight={
        <Button
          type="link"
          icon={<IconTakeoff />}
          size="small"
          onClick={() => setIsDrawHome(true)}
        >
          {takeOffRefPoint ? '重设' : '设置'}起飞点
        </Button>
      }
    />
  )
}

/** 参考起飞点设置 */
const memorizedCpn = memo(TakeOffPointConfig)
memorizedCpn.displayName = 'TakeOffPointConfig'

export default memorizedCpn
