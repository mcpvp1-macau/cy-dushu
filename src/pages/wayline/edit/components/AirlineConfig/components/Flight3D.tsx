import AsyncButton from '@/components/ui/button/AsyncButton'
import XCard from '@/components/ui/XCard'
import { calcFlight3DRoute } from '@/service/modules/flight3D'
import { AirpointsConfigItem } from '@/store/wayline/uav-airline/types'
import useAirlineConfigStore from '@/store/wayline/uav-airline/useAirlineConfig.store'
import { InfoCircleOutlined } from '@ant-design/icons'
import { Tooltip } from 'antd'
import { v4 } from 'uuid'

type PropsType = unknown

const Flight3D: FC<PropsType> = memo(() => {
  const handleClick = async () => {
    const airpoints = useAirlineConfigStore.getState().airpointsConfig
    const resp = await calcFlight3DRoute({
      points: airpoints.map((item) => ({
        lon: item.pointX,
        lat: item.pointY,
        alt: item.pointZ,
      })),
      resolution: 5,
      safedist: 10,
    })

    if (
      Array.isArray(resp.data?.results) &&
      resp.data.results.length === airpoints.length - 1
    ) {
      const result = resp.data.results
      const newAirpoints: AirpointsConfigItem[] = []
      for (let i = 0; i < airpoints.length - 1; i++) {
        newAirpoints.push({
          ...airpoints[i],
          positionIndex: newAirpoints.length,
          positionName: `航点${newAirpoints.length}`,
        })
        for (let j = 1; j < result[i].waypoints.length - 1; j++) {
          const item = result[i].waypoints[j]
          newAirpoints.push({
            xid: v4(),
            pointX: item.lon,
            pointY: item.lat,
            pointZ: item.alt,
            actions: [] as any,
            positionIndex: newAirpoints.length,
            positionName: `航点${newAirpoints.length}`,
          })
        }
      }
      newAirpoints.push({
        ...airpoints[airpoints.length - 1],
        positionIndex: newAirpoints.length,
        positionName: `航点${newAirpoints.length}`,
      })
      useAirlineConfigStore.getState().updateAirpointsConfig(newAirpoints)
    }
  }

  return (
    <XCard
      title={
        <div className="flex gap-1 ">
          3D飞行
          <Tooltip title="根据航线点位生成绕开3D模型的路径路径">
            <InfoCircleOutlined className="text-fore" />
          </Tooltip>
        </div>
      }
      topRight={
        <AsyncButton size="small" onClick={handleClick}>
          计算
        </AsyncButton>
      }
    ></XCard>
  )
})

Flight3D.displayName = 'Flight3D'

export default Flight3D
