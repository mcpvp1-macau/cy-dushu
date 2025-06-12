import IconPath from '@/assets/icons/jsx/IconPath'
import IconPointFly from '@/assets/icons/jsx/uav/IconPointFly'
import XCard from '@/components/ui/XCard'
import { useAppMsg } from '@/hooks/useAppMsg'
import { getCalcUavRoadShortestPath } from '@/service/modules/geo'
import { AirpointsConfigItem } from '@/store/wayline/uav-airline/types'
import useAirlineConfigStore from '@/store/wayline/uav-airline/useAirlineConfig.store'
import { Button, Switch } from 'antd'
import { v4 } from 'uuid'

type PropsType = unknown

const RoadNetworkMode: FC<PropsType> = memo(() => {
  const { t } = useTranslation()
  const enableRoadNetworkMode = useAirlineConfigStore(
    (s) => s.airlineConfig.roadNetworkMode,
  )
  const roadNetworkTargetPosition = useAirlineConfigStore(
    (s) => s.airlineConfig.roadNetworkTargetPosition,
  )
  const takeOffRefPoint = useAirlineConfigStore(
    (s) => s.airlineConfig.takeOffRefPoint,
  )
  const msgApi = useAppMsg()

  const [loading, setLoading] = useState(false)
  const handleCalc = async () => {
    setLoading(true)
    try {
      const resp = await getCalcUavRoadShortestPath({
        sLng: takeOffRefPoint![0],
        sLat: takeOffRefPoint![1],
        tLng: roadNetworkTargetPosition![0],
        tLat: roadNetworkTargetPosition![1],
      })
      const store = useAirlineConfigStore.getState()
      const h = store.airlineConfig.height
      if (resp.data) {
        const airpoints = resp.data.map<AirpointsConfigItem>((e, i) => ({
          pointX: e[0],
          pointY: e[1],
          pointZ: h,
          xid: v4(),
          actions: [],
          positionIndex: i,
          positionName: `航点${i + 1}`,
        }))
        airpoints.push({
          pointX: roadNetworkTargetPosition![0],
          pointY: roadNetworkTargetPosition![1],
          pointZ: h,
          xid: v4(),
          actions: [],
          positionIndex: airpoints.length,
          positionName: `航点${airpoints.length + 1}`,
        })
        store.updateAirpointsConfig(airpoints)
      } else {
        msgApi.error(resp.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <XCard
      title={t('wayline.roadNetwork.title')}
      topRight={
        <Switch
          size="small"
          className="mr-1"
          value={enableRoadNetworkMode}
          onChange={(e) => {
            const airlineConfig = useAirlineConfigStore.getState().airlineConfig
            useAirlineConfigStore.setState({
              airlineConfig: {
                ...airlineConfig,
                roadNetworkMode: e,
              },
            })
          }}
        />
      }
    >
      {enableRoadNetworkMode && (
        <div className="flex items-center justify-between gap-1 mt-2">
          <p>目标位置</p>
          <div className="flex items-center gap-2">
            <Button
              type="link"
              size="small"
              icon={<IconPointFly />}
              onClick={() => {
                useAirlineConfigStore.getState().updateIsDrawRoadTarget(true)
              }}
            >
              {roadNetworkTargetPosition ? t('common.reset') : t('common.set')}
            </Button>
            {roadNetworkTargetPosition && takeOffRefPoint && (
              <Button
                size="small"
                loading={loading}
                icon={<IconPath />}
                onClick={handleCalc}
              >
                计算
              </Button>
            )}
          </div>
        </div>
      )}
    </XCard>
  )
})

RoadNetworkMode.displayName = 'RoadNetworkMode'

export default RoadNetworkMode
