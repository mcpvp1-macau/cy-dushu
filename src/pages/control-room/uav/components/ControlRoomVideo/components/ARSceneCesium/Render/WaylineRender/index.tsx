import useMixARStore from '@/store/control-room/useMixAR.store'
import useARSettingStore from '@/store/setting/useARSetting.store'
import WalylinePrimitive from '@/utils/customPrimitive/WaylinePrimitive'
import { attempt } from 'lodash'
import { LayerEnum } from '../Enum'
import * as Cesium from 'cesium'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { ARSceneCesiumContext } from '../context'
import { useContext } from 'react'

const WaylineRender = () => {
  const { ocrc } = useContext(ARSceneCesiumContext)

  const airpointPositions = useMixARStore((s) => s.airpointPositions)
  const positions = useMemo<[number, number, number][]>(
    () => airpointPositions.map((e) => [e.pointX, e.pointY, e.pointZ - 10]),
    [airpointPositions],
  )

  const waylineColor = useARSettingStore((s) => s.wayline.color)
  const waylineEnable = useARSettingStore((s) => s.wayline.enable)

  const [waylinePrimitive, setWaylinePrimitive] =
    useState<WalylinePrimitive | null>(null)

  useEffect(() => {
    const walylinePrimitive = new WalylinePrimitive({
      positions: positions,
      indicatorLength: 60,
      indicatorSpeed: 600,
      indicatorSpace: 1200,
    })

    ocrc!.orderPrimitives[LayerEnum.wayline].add(walylinePrimitive)

    setWaylinePrimitive(walylinePrimitive)

    return () => {
      attempt(() => {
        ocrc!.orderPrimitives[LayerEnum.wayline].remove(waylinePrimitive)
      })
      setWaylinePrimitive(null)
    }
  }, [])

  const waypointIndex = useUavControlRoomStore((s) => s.state.waypointIndex)
  useEffect(() => {
    if (!waylinePrimitive) return

    if (waypointIndex === undefined || waypointIndex > positions.length) {
      waylinePrimitive.activeFragment = 0
      return
    }

    waylinePrimitive.activeFragment = waypointIndex
  }, [waypointIndex])

  useEffect(() => {
    if (!waylinePrimitive) return

    waylinePrimitive.positions = positions
    waylinePrimitive.waylineColor =
      Cesium.Color.fromCssColorString(waylineColor)
    waylinePrimitive.waylineMinMaxOpacity = new Cesium.Cartesian2(
      0.05,
      Cesium.Color.fromCssColorString(waylineColor).alpha,
    )
    waylinePrimitive.show = waylineEnable
  }, [waylinePrimitive, positions, waylineColor, waylineEnable])

  return <></>
}

WaylineRender.displayName = 'WaylineRender'

export default WaylineRender
