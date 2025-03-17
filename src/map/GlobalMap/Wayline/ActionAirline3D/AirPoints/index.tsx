import type { FC } from 'react'
import { memo } from 'react'
import Airpoint from './Airpoint'
import PathLine from './PathLine'
import HomePathLine from './HomePathLine'
import useAirlineConfigStore from '@/store/uav/uav-airline/useAirlineConfig.store'

type PropsType = unknown

const AirPoints: FC<PropsType> = () => {
  const airpointsConfig = useAirlineConfigStore((s) => s.airpointsConfig)
  const takeOffRefPoint = useAirlineConfigStore(
    (s) => s.airlineConfig.takeOffRefPoint,
  )

  return (
    <>
      {/* 航点 */}
      {airpointsConfig.map((point: any) => (
        <Airpoint key={point.xid} point={point} />
      ))}
      {/* 航点之间的连线 */}
      {airpointsConfig.map((point, i) => {
        const nextPoint = airpointsConfig[i + 1]
        if (!nextPoint) {
          return null
        }
        return (
          <PathLine
            key={`${point.xid}-${nextPoint.xid}`}
            point1={point}
            point2={nextPoint}
          />
        )
      })}
      {
        // 起飞点与第一个航点之间的连线
        takeOffRefPoint && airpointsConfig[0] && (
          <HomePathLine
            key={`home-${airpointsConfig[0].xid}`}
            homePoint={takeOffRefPoint}
            point1={[
              airpointsConfig[0].pointX,
              airpointsConfig[0].pointY,
              airpointsConfig[0].pointZ,
            ]}
          />
        )
      }
    </>
  )
}

export default memo(AirPoints)
