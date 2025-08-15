import { FC } from 'react'
import { useRebotDogControlRoomStore } from '@/store/context-store/useRebotDogControlRoom.store'
import * as THREE from 'three'
import { Html, Line } from '@react-three/drei'
import { Button, ConfigProvider, theme } from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'
import { usePostDeviceService } from '@/hooks/device/usePostDeviceService'

const PointActionMap: FC = () => {
  const x = useRebotDogControlRoomStore((s) => s.state.x || 0)
  const y = useRebotDogControlRoomStore((s) => s.state.y || 0)
  const z = useRebotDogControlRoomStore((s) => s.state.z || 0)
  const pointAction = useRebotDogControlRoomStore((s) => s.pointAction)
  const deviceId = useRebotDogControlRoomStore((s) => s.deviceId)
  const productKey = useRebotDogControlRoomStore((s) => s.productKey)

  const postDeviceService = usePostDeviceService(productKey, deviceId)

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

  if (!pointAction.open || !pointAction.targetPosition) return null

  const targetPosition = new THREE.Vector3(
    pointAction.targetPosition[0],
    pointAction.targetPosition[1],
    pointAction.targetPosition[2],
  )

  return (
    <>
      <sprite
        scale={0.05}
        center={new THREE.Vector2(0.5, 0)}
        position={targetPosition}
      >
        <spriteMaterial
          sizeAttenuation={false}
          map={new THREE.TextureLoader().load('/images/marker/map-marker1.png')}
          depthTest={false}
        ></spriteMaterial>
      </sprite>
      <Line
        points={[
          new THREE.Vector3(x, y, z),
          new THREE.Vector3(pointAction.targetPosition[0], pointAction.targetPosition[1], pointAction.targetPosition[2]),
        ]}
        color="#3d87e9"
        linewidth={2}
      />
      <Html position={targetPosition}>
        <div className="p-2 flex flex-col gap-1 text-fore bg-[#27303b] min-w-[150px] rounded-md shadow-lg">
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
            <InfoCircleOutlined className="text-orange-400" /> {'路线仅供参考'}
          </p>
          <ConfigProvider
            theme={{
              algorithm: theme.darkAlgorithm,
              token: {
                colorFillTertiary: 'rgba(112, 163, 251, 0.3)',
                colorBorder: '#37414D',
                boxShadow: 'none',
                colorBgSpotlight: 'rgba(0,0,0,1)',
                colorBgContainer: 'rgba(0,0,0,0)',
                borderRadius: 3,
                controlHeight: 30,
                colorBgElevated: '#28323C',
                colorBgContainerDisabled: '#262e36',
                colorPrimaryActive: '#4C90F0',
                colorPrimaryHover: '#4C90F0',
                colorPrimary: '#4C90F0',
              },
              components: {
                Button: {
                  defaultBg: '#28323C',
                  defaultBorderColor: '#37414D',
                  defaultActiveBg: '#28323C',
                  defaultActiveBorderColor: '#37414D',
                  defaultHoverBg: '#28323C',
                  defaultHoverBorderColor: '#37414D',
                  contentLineHeightSM: 1,
                  boxShadow: 'none',
                  defaultShadow: 'none',
                  dangerShadow: 'none',
                  primaryShadow: 'none',
                },
              },
            }}
          >
            <p className="flex justify-between">
              <Button
                size="small"
                onClick={() => {
                  updatePointAction({
                    open: false,
                    targetPosition: undefined,
                  })
                }}
              >
                取消
              </Button>
              <Button
                size="small"
                type="primary"
                //   onClick={setParamsOpenTrue}
                //   loading={!!(parentId && !parentDeivceDetail)}
                onClick={() => {
                  postDeviceService('gotoPositionROS', {
                    timestamp: Date.now(),
                    data: {
                      mode: '1',
                      speed: 0.5,
                      targetPose: {
                        x: pointAction.targetPosition?.[0],
                        y: pointAction.targetPosition?.[1],
                        z: pointAction.targetPosition?.[2],
                        q_x: 0,
                        q_y: 0,
                        q_z: 0,
                        q_w: 1,
                      },
                    },
                  })
                }}
              >
                指点前进
              </Button>
            </p>
          </ConfigProvider>
        </div>
      </Html>
    </>
  )
}

export default PointActionMap
