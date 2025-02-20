import { heartbeat } from '@/constant/websocket'
import useUserStore from '@/store/useUser.store'
import useWebSocket from 'react-use-websocket'
import { v4 } from 'uuid'
import { ControlStationInfo, UavInfo, WsData } from './types'
import { shouldJson } from '@/utils/json'
import { getCitySituationUavTrack } from '@/service/modules/db-api'
import { dft } from '@/constant/time-fmt'
import { isSame, pathCompress } from '@/utils/path'
import { isNil } from 'lodash'
import { BillboardCollection, LabelCollection } from 'resium'
import RIDTarget from './RIDTarget'

type PropsType = {
  targetIds: string[]
}

type TargetsType = Record<
  string,
  { uav: UavInfo[]; controlStation: ControlStationInfo[] }
>

/** RID 目标们 */
const RIDTargets: FC<PropsType> = memo(({ targetIds }) => {
  const username = useUserStore((s) => s.user?.username)
  const wsUrl = useMemo(() => {
    if (!username) {
      return null
    }
    return `/ws/rid/${username}/${v4()}/${targetIds.join(',')}`
  }, [username, targetIds])

  const [targets, setTargets] = useState<TargetsType>({})

  const queryClient = useQueryClient()
  const { data: respData } = useQuery(
    {
      queryKey: ['getCitySituationUavTrack', targetIds],
      queryFn: () => {
        const now = dayjs()
        return getCitySituationUavTrack({
          ids: targetIds,
          startTime: now.subtract(120, 'minutes').format(dft),
          endTime: now.format(dft),
        })
      },
      select: (d) => d.data,
    },
    queryClient,
  )

  // 历史轨迹数据
  useEffect(() => {
    if (!respData) {
      return
    }
    const newTargets: TargetsType = {}
    for (const item of respData) {
      const t = dayjs(item.acquireTime).valueOf()
      newTargets[item.id] ??= { uav: [], controlStation: [] }

      newTargets[item.id].uav.push({
        lng: item.lng,
        lat: item.lat,
        height: item.height,
        alt: item.locationAlit,
        speedH: item.speedH,
        speedV: item.speedV,
        t: t,
      })

      if (item.controlStationLng && item.controlStationLat) {
        newTargets[item.id].controlStation.push({
          lng: item.controlStationLng,
          lat: item.controlStationLat,
          t: t,
        })
      }
    }

    for (const id in newTargets) {
      newTargets[id].uav = pathCompress(newTargets[id].uav)
      newTargets[id].controlStation = pathCompress(
        newTargets[id].controlStation,
      )
      console.log(newTargets[id].uav)
    }

    setTargets(newTargets)
  }, [respData])

  // 处理消息 (实时轨迹数据)
  const handleMessage = useMemoizedFn((msg: MessageEvent) => {
    const data = shouldJson<WsData>(msg.data)
    if (!data?.data) {
      return
    }
    const { data: d } = data
    const id = d.basic_info.basic_uaid
    const newTargets = { ...targets }
    newTargets[id] ??= { uav: [], controlStation: [] }

    // 无人机经纬度信息
    const uav = d.location_info
    if (
      !isNil(uav.location_lon) &&
      !isNil(uav.location_lat) &&
      (uav.location_lon || uav.location_lat)
    ) {
      if (
        newTargets[id].uav.length === 0 ||
        !isSame(
          [newTargets[id].uav.at(-1)!.lng, newTargets[id].uav.at(-1)!.lat],
          [uav.location_lon, uav.location_lat],
        )
      ) {
        newTargets[id].uav.push({
          lng: uav.location_lon,
          lat: uav.location_lat,
          height: uav.location_height ?? 0,
          alt: uav.location_alit ?? 0,
          speedH: uav.location_speed_h ?? 0,
          speedV: uav.location_speed_v ?? 0,
          t: data.timestamp,
        })
      }
    }

    // 控制站经纬度信息
    const cs = d.system_info ?? {}
    if (
      !isNil(cs.sys_lon) &&
      !isNil(cs.sys_lat) &&
      (cs.sys_lon || cs.sys_lat)
    ) {
      if (
        newTargets[id].controlStation.length === 0 ||
        !isSame(
          [
            newTargets[id].controlStation.at(-1)!.lng,
            newTargets[id].controlStation.at(-1)!.lat,
          ],
          [cs.sys_lon, cs.sys_lat],
        )
      ) {
        newTargets[id].controlStation.push({
          lng: cs.sys_lon,
          lat: cs.sys_lat,
          t: data.timestamp,
        })
      }
    }
    setTargets(newTargets)
  })

  useWebSocket(wsUrl, {
    heartbeat,
    onMessage: handleMessage,
    reconnectAttempts: 0x3f3f3f3f,
    retryOnError: true,
    reconnectInterval: 5_000,
    shouldReconnect: () => true,
  })

  console.log(targets)

  return (
    <BillboardCollection>
      <LabelCollection>
        {Object.entries(targets).map(([id, { uav, controlStation }]) => {
          return <RIDTarget id={id} key={id} uav={uav} cs={controlStation} />
        })}
      </LabelCollection>
    </BillboardCollection>
  )
})

RIDTargets.displayName = 'RIDTargets'

export default RIDTargets
