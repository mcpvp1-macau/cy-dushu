import { resolvePositions } from '@/pages/wayline/edit/utils'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { getLatestTask } from '@/service/modules/airline'
import { shouldJson } from '@/utils/json'
import AirPoint from './AirPoint'
import PathLine from './PathLine'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import Forecast from './Forecast'
import useMixARStore from '@/store/control-room/useMixAR.store'

type PropsType = unknown

/** 最新任务 */
const LastestTask: FC<PropsType> = memo(() => {
  const deviceId = useDeviceDetailStore((s) => s.deviceId)
  const queryClient = useQueryClient()
  const { data: taskData } = useQuery(
    {
      queryKey: ['getLatestTask', deviceId],
      queryFn: () => getLatestTask(deviceId!),
      select: (d) => d.data,
    },
    queryClient,
  )

  const displayMode = useUavControlRoomStore((s) => s.state.displayMode)

  const updateAirpointPositions = useMixARStore(
    (s) => s.updateAirpointPositions,
  )

  const positions = useMemo(() => {
    const parameters = shouldJson(taskData?.parameters)
    if (!parameters?.spaces?.[0]?.positions) {
      return
    }
    const positions = resolvePositions(parameters.spaces[0].positions)
    if (Array.isArray(positions)) {
      updateAirpointPositions(positions)
    }
    return positions
  }, [taskData?.id])

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
