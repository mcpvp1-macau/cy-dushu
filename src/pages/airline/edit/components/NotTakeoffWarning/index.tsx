import SnackBar from '@/components/ui/SnackBar'
import useAirlineConfigStore from '@/store/uav/uav-airline/useAirlineConfig.store'
import { memo, type FC } from 'react'

type PropsType = unknown

/** 没有时起飞点展示 */
const NotTakeoffWarning: FC<PropsType> = () => {
  const takeOff = useAirlineConfigStore(
    (s) => !!s.airlineConfig.takeOffRefPoint,
  )

  return <SnackBar open={!takeOff}>点击地图设置参考起飞点</SnackBar>
}

export default memo(NotTakeoffWarning)
