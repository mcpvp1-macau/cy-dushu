import Select from '@/components/AntdOverride/Select'
import AsyncButton from '@/components/ui/button/AsyncButton'
import LiqunTippy from '@/components/ui/LiqunTippy'
import XCard from '@/components/ui/XCard'
import { useAppMsg } from '@/hooks/useAppMsg'
import { calcFlight3DRoute } from '@/service/modules/flight3D'
import { AirpointsConfigItem } from '@/store/wayline/uav-airline/types'
import useAirlineConfigStore from '@/store/wayline/uav-airline/useAirlineConfig.store'
import { InfoCircleOutlined } from '@ant-design/icons'
import { v4 } from 'uuid'

type PropsType = unknown

const Flight3D: FC<PropsType> = memo(() => {
  const msgApi = useAppMsg()

  const [region, setRegion] = useState('xiaozhen')

  const handleClick = async () => {
    const store = useAirlineConfigStore.getState()
    const airpoints = store.airpointsConfig
    const executeHeightMode = store.airlineConfig.executeHeightMode
    const takeOffHeight = store.airlineConfig.takeOffRefPoint?.[2] ?? 0

    const resp = await calcFlight3DRoute({
      points: airpoints.map((item) => ({
        lon: item.pointX,
        lat: item.pointY,
        alt:
          item.pointZ +
          (executeHeightMode === 'relativeToStartPoint' ? takeOffHeight : 0),
      })),
      region,
      maxsamples: 200,
    })

    if (
      !Array.isArray(resp.data?.results) ||
      resp.data.results.length !== airpoints.length - 1
    ) {
      msgApi.error('3D飞行计算失败，请稍后重试')
      return
    }

    const result = resp.data.results as any[]

    const newAirpoints: AirpointsConfigItem[] = []
    for (let i = 0; i < airpoints.length - 1; i++) {
      if (!result[i].success) {
        msgApi.error(
          `航点 ${i + 1} 到航点 ${i + 2} 的3D飞行计算失败：${
            result[i].message || '未知原因'
          }`,
        )
        return
      }
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
      xid: v4(),
    })

    // 调整高度
    if (executeHeightMode === 'relativeToStartPoint') {
      for (let i = 0; i < newAirpoints.length; i++) {
        newAirpoints[i].pointZ -= takeOffHeight
      }
    }
    useAirlineConfigStore.getState().updateAirpointsConfig(newAirpoints)
  }

  return (
    <XCard
      title={
        <div className="flex gap-1 ">
          3D飞行
          <LiqunTippy content="根据航线点位生成绕开3D模型的路径路径">
            <InfoCircleOutlined className="text-fore" />
          </LiqunTippy>
        </div>
      }
      topRight={
        <div className="flex gap-2">
          <Select
            className="w-32"
            size="small"
            options={[
              { label: 'xiaozhen', value: 'xiaozhen' },
              {
                label: 'aoti',
                value: 'aoti',
              },
            ]}
            value={region}
            onChange={(val) => setRegion(val)}
          />
          <AsyncButton size="small" onClick={handleClick} successMsg="">
            计算
          </AsyncButton>
        </div>
      }
    ></XCard>
  )
})

Flight3D.displayName = 'Flight3D'

export default Flight3D
