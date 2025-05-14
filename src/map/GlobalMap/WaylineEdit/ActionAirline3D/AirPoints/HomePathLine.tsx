import { useShallow } from 'zustand/react/shallow'
import useAirlineConfigStore from '@/store/wayline/uav-airline/useAirlineConfig.store'
import Path from './Path'

type PropsType = {
  homePoint: number[]
  point1: number[]
}

/** 起飞点连接线 */
const HomePathLine: FC<PropsType> = ({ homePoint, point1 }) => {
  const config = useAirlineConfigStore(
    useShallow((s) => ({
      flyToWaylineMode: s.airlineConfig.flyToWaylineMode,
      takeOffSecurityHeight: s.airlineConfig.takeOffSecurityHeight,
    })),
  )

  const positions = useMemo(() => {
    if (config.flyToWaylineMode === 'safely') {
      return [
        {
          pointX: homePoint[0],
          pointY: homePoint[1],
          pointZ: homePoint[2],
        },
        {
          pointX: homePoint[0],
          pointY: homePoint[1],
          pointZ: Math.max(
            config.takeOffSecurityHeight + homePoint[2],
            point1[2],
          ),
        },
        {
          pointX: point1[0],
          pointY: point1[1],
          pointZ: Math.max(
            config.takeOffSecurityHeight + homePoint[2],
            point1[2],
          ),
        },
        {
          pointX: point1[0],
          pointY: point1[1],
          pointZ: point1[2],
        },
      ]
    } else {
      return [
        {
          pointX: homePoint[0],
          pointY: homePoint[1],
          pointZ: homePoint[2],
        },
        {
          pointX: homePoint[0],
          pointY: homePoint[1],
          pointZ: Math.min(
            config.takeOffSecurityHeight + homePoint[2],
            point1[2],
          ),
        },
        {
          pointX: point1[0],
          pointY: point1[1],
          pointZ: point1[2],
        },
      ]
    }
  }, [config, homePoint, point1])

  return (
    <>
      <Path data={positions as any} deltaHeight={0} />
      <Path data={positions as any} deltaHeight={0} isVirtual />
    </>
  )
}

export default memo(HomePathLine)
