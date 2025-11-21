import { useRebotDogControlRoomStore } from '@/store/context-store/useRebotDogControlRoom.store'
import * as THREE from 'three'
import { Line } from '@react-three/drei'
import { Button, ConfigProvider } from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'
import { usePostDeviceService } from '@/hooks/device/usePostDeviceService'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import PositionTooltip from '@/components/three/PositionTooltip'
import { themeConfig } from '@/config/theme-config'

const PointActionMap: FC = () => {
  const x = useRebotDogControlRoomStore((s) => s.state.x || 0)
  const y = useRebotDogControlRoomStore((s) => s.state.y || 0)
  const z = useRebotDogControlRoomStore((s) => s.state.z || 0)
  const pointAction = useRebotDogControlRoomStore((s) => s.pointAction)
  const deviceId = useRebotDogControlRoomStore((s) => s.deviceId)
  const productKey = useDeviceDetailStore(
    (s) => s.deviceDetail?.deviceModel?.productKey,
  )

  const displayMode = useRebotDogControlRoomStore((s) => s.state.displayMode)

  const postDeviceService = usePostDeviceService(productKey!, deviceId)

  const distance = useMemo(() => {
    if (!pointAction.targetPosition) return 0
    return Math.sqrt(
      (pointAction.targetPosition[0] - x) ** 2 +
        (pointAction.targetPosition[1] - y) ** 2 +
        (pointAction.targetPosition[2] - z) ** 2,
    )
  }, [pointAction.targetPosition, x, y, z])
  const predicateTime = distance / 0.5

  const updatePointAction = useRebotDogControlRoomStore(
    (s) => s.updatePointAction,
  )

  const modeRef = useRef<string | undefined>(undefined)

  useEffect(() => {
    console.log('displayMode', displayMode)
    // 从 指点前进 模式 切换到 其他模式 时，关闭指点前进
    if (!displayMode?.includes('指点') && !modeRef.current?.includes('指点')) {
      updatePointAction({
        open: false,
        targetPosition: undefined,
        confirm: false,
      })
    }
    modeRef.current = displayMode
  }, [displayMode])

  if (!pointAction.open && !pointAction.targetPosition) return null

  const targetPosition = new THREE.Vector3(
    pointAction.targetPosition?.[0] || 0,
    pointAction.targetPosition?.[1] || 0,
    pointAction.targetPosition?.[2] || 0,
  )

  return (
    <>
      {pointAction.targetPosition ? (
        <sprite
          scale={0.05}
          center={new THREE.Vector2(0.5, 0)}
          position={targetPosition}
        >
          <spriteMaterial
            sizeAttenuation={false}
            map={new THREE.TextureLoader().load(
              '/images/marker/icon/targetPoint.svg',
            )}
            depthTest={false}
          ></spriteMaterial>
        </sprite>
      ) : null}
      <Line
        points={[
          new THREE.Vector3(x, y, z),
          new THREE.Vector3(
            pointAction.targetPosition?.[0] || 0,
            pointAction.targetPosition?.[1] || 0,
            pointAction.targetPosition?.[2] || 0,
          ),
        ]}
        color="#3d87e9"
        linewidth={2}
      />
      {pointAction.confirm && (
        <PositionTooltip position={targetPosition} offset={[0, 30]}>
          <ConfigProvider theme={themeConfig}>
            <div className="p-2 flex flex-col gap-1 text-fore min-w-[150px] rounded-md shadow-lg">
              <p className="flex justify-between">
                {'任务距离'}:{' '}
                <span>
                  {distance > 1_000
                    ? `${(distance / 1_000).toFixed(1)} km`
                    : `${distance.toFixed(1)} m`}
                </span>
              </p>
              <p className="flex justify-between">
                {'预估时间'}: <span>{predicateTime.toFixed(1)} s</span>
              </p>
              <p>
                <InfoCircleOutlined className="text-orange-400" />{' '}
                {'路线仅供参考'}
              </p>

              <p className="flex justify-between">
                <Button
                  size="small"
                  onClick={() => {
                    updatePointAction({
                      open: false,
                      targetPosition: undefined,
                      confirm: false,
                    })
                  }}
                >
                  取消
                </Button>
                <Button
                  size="small"
                  type="primary"
                  onClick={async () => {
                    await postDeviceService('gotoPositionROS', {
                      timestamp: Date.now(),
                      data: {
                        mode: '0',
                        speed: 0.5,
                        targetPose: {
                          x: pointAction.targetPosition?.[0],
                          y: pointAction.targetPosition?.[1],
                          z: 0.14,
                          q_x: 0,
                          q_y: 0,
                          q_z: 0,
                          q_w: 1,
                        },
                      },
                    })
                    updatePointAction({
                      open: false,
                      confirm: false,
                    })
                  }}
                >
                  指点前进
                </Button>
              </p>
            </div>
          </ConfigProvider>
        </PositionTooltip>
      )}
    </>
  )
}

export default PointActionMap
