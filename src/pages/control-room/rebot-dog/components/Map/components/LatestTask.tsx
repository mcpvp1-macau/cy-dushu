import { getWaylinePointBillboardSvgURI } from '@/components/Icon/WaylinePoint'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { getLatestTask } from '@/service/modules/wayline'
import { shouldJson } from '@/utils/json'
import { Line } from '@react-three/drei'
import { Fragment } from 'react/jsx-runtime'
import { TextureLoader, Vector3 } from 'three'

type PropsType = unknown

const RebotDogLatestTask: FC<PropsType> = memo(() => {
  const deviceId = useDeviceDetailStore((s) => s.deviceId)

  const queryClient = useQueryClient()
  const { data: taskData } = useQuery(
    {
      queryKey: ['getLatestTask', deviceId],
      queryFn: () => getLatestTask(deviceId),
      enabled: !!deviceId,
      select: (d) => d.data,
    },
    queryClient,
  )

  const status = taskData?.status

  if (!status || status === 'FINISH') {
    return null
  }

  const waypoints = shouldJson(taskData.parameters)?.spaces?.[0]?.positions

  return (
    <>
      {waypoints.map((e, i) => (
        <Fragment key={e.positionIndex}>
          <sprite scale={0.05} position={new Vector3(e.x, e.y, e.z)}>
            <spriteMaterial
              sizeAttenuation={false}
              map={new TextureLoader().load(
                getWaylinePointBillboardSvgURI({
                  color: '#4e85e1',
                  text: i + 1,
                }),
              )}
              depthTest={false}
            ></spriteMaterial>
          </sprite>
        </Fragment>
      ))}
      {waypoints.length >= 2 && (
        <Line
          points={waypoints.map((e) => new Vector3(e.x, e.y, e.z))}
          color="#4e85e1"
          lineWidth={3} // 折线宽度
        />
      )}
    </>
  )
})

RebotDogLatestTask.displayName = 'RebotDogLatestTask'

export default RebotDogLatestTask
