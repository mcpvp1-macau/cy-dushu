import Airpoint from './Airpoint'
import HomePathLine from './HomePathLine'
import useAirlineConfigStore from '@/store/wayline/uav-airline/useAirlineConfig.store'
import Path from './Path'
import SafetyCheck from './SafetyCheck'

type PropsType = unknown

const AirPoints: FC<PropsType> = () => {
  const airpointsConfig = useAirlineConfigStore((s) => s.airpointsConfig)
  const takeOffRefPoint = useAirlineConfigStore(
    (s) => s.airlineConfig.takeOffRefPoint,
  )

  const deltaHeight = useAirlineConfigStore((s) => {
    if (s.airlineConfig.executeHeightMode === 'WGS84') {
      return 0
    }
    return s.airlineConfig.takeOffRefPoint?.[2] ?? 0
  })

  const points = useMemo(() => {
    return airpointsConfig.map((point) => ({
      pointX: point.pointX,
      pointY: point.pointY,
      pointZ: point.pointZ + deltaHeight,
    }))
  }, [airpointsConfig, deltaHeight])

  return (
    <>
      {/* 航点 */}
      {airpointsConfig.map((point: any) => (
        <Airpoint key={point.xid} point={point} deltaHeight={deltaHeight} />
      ))}
      {/* 航点之间的连线 */}
      <Path data={airpointsConfig} deltaHeight={deltaHeight} />
      {
        // 起飞点与第一个航点之间的连线
        takeOffRefPoint && airpointsConfig[0] && (
          <HomePathLine
            key={`home-${airpointsConfig[0].xid}`}
            homePoint={takeOffRefPoint}
            point1={[
              airpointsConfig[0].pointX,
              airpointsConfig[0].pointY,
              airpointsConfig[0].pointZ + deltaHeight,
            ]}
            deltaHeight={deltaHeight}
          />
        )
      }
      {takeOffRefPoint && (
        <SafetyCheck airpoints={points} takeOffRefPoint={takeOffRefPoint} />
      )}
    </>
  )
}

export default memo(AirPoints)
