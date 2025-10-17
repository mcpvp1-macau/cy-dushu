import { resolvePositions } from '@/pages/wayline/edit/utils'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { shouldJson } from '@/utils/json'
import AirPoint from './AirPoint'
import PathLine from './PathLine'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import Forecast from './Forecast'
import useMixARStore from '@/store/control-room/useMixAR.store'
import useDeviceLatestTaskStore from '@/store/useDeviceLatestTask.store'

type PropsType = unknown

/** 最新任务 */
const LastestTask: FC<PropsType> = memo(() => {
  const deviceId = useDeviceDetailStore((s) => s.deviceId)
  const taskData = useDeviceLatestTaskStore((s) => s.latestTask[deviceId]) // 订阅最新任务数据变化

  const displayMode = useUavControlRoomStore((s) => s.state.displayMode)

  const updateAirpointPositions = useMixARStore(
    (s) => s.updateAirpointPositions,
  )

  const takeOffHeight = useUavControlRoomStore((s) => s.takeOffHeight)
  const positions = useMemo(() => {
    const parameters = shouldJson(taskData?.parameters)
    const taskBasic = shouldJson(taskData?.taskBasic)
    if (!parameters?.spaces?.[0]?.positions) {
      return
    }
    let positions = resolvePositions(parameters.spaces[0].positions)
    if (!Array.isArray(positions)) {
      return []
    }
    // 高度偏移
    const deltaHeight =
      taskBasic.executeHeightMode === 'WGS84'
        ? 0
        : takeOffHeight ??
          (taskBasic?.takeOffRefPoint?.[2] as number | undefined)

    positions = positions.map((e) => ({
      ...e,
      pointZ: e.pointZ + deltaHeight - 1,
    }))

    updateAirpointPositions(positions)
    return positions
  }, [taskData?.id, takeOffHeight])

  if (!positions || taskData?.status === 'FINISH') {
    return null
  }

  return (
    <>
      {positions.map((item: any) => (
        <AirPoint
          key={item.id}
          positionIndex={item.positionIndex}
          lng={item.pointX}
          lat={item.pointY}
          alt={item.pointZ}
        />
      ))}
      {positions.map(
        (item: any, i: number) =>
          i > 0 && (
            <PathLine
              key={item.id}
              from={[
                positions[i - 1].pointX,
                positions[i - 1].pointY,
                positions[i - 1].pointZ,
              ]}
              to={[item.pointX, item.pointY, item.pointZ]}
            />
          ),
      )}
      {(displayMode as string)?.includes('航线飞行') && (
        <Forecast positions={positions} />
      )}
    </>
  )
})

LastestTask.displayName = 'LastestTask'

export default LastestTask
