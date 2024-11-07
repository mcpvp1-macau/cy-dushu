import PositionTooltip from '@/components/map/PostionTooltip'
import { usePostDeviceService } from '@/hooks/device/usePostDeviceService'
import { useAppMsg } from '@/hooks/useAppMsg'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { getSpaceDistance } from '@/utils/geo-math'
import { InfoCircleOutlined } from '@ant-design/icons'
import { Button } from 'antd'

type PropsType = {
  position: [number, number]
}

const UavPointFlyConfirm: FC<PropsType> = memo(({ position }) => {
  const uavLon = useUavControlRoomStore((s) => s.state.longitude)
  const uavLat = useUavControlRoomStore((s) => s.state.latitude)
  const speed = useUavControlRoomStore((s) => s.flyParams.flySpeed)
  const height = useUavControlRoomStore((s) => s.flyParams.targetHeight)

  const updatePointFly = useUavControlRoomStore((s) => s.updatePointFly)

  const distance = useMemo(() => {
    if (!uavLon || !uavLat) {
      return 0
    }
    return getSpaceDistance([
      [uavLon, uavLat],
      [position[0], position[1]],
    ])
  }, [uavLon, uavLat, position])

  const t = distance / speed / 60

  const deviceId = useDeviceDetailStore((s) => s.deviceId)
  const productKey = useDeviceDetailStore((s) => s.productKey)
  const postService = usePostDeviceService(productKey, deviceId)

  const msgApi = useAppMsg()
  const handleConfirm = async () => {
    if (!height) {
      msgApi.error('请设置飞行目标高度')
      return
    }
    await postService('gotoPosition', {
      longitude: position[0],
      latitude: position[1],
      height,
      speed,
    })
    updatePointFly({
      open: false,
      targetPosition: null,
    })
  }

  return (
    <>
      <PositionTooltip offset={[0, 30]} position={position} alwayInViewport>
        <div className="flex flex-col gap-1 text-fore p-1">
          <p className="flex justify-between">
            任务距离:{' '}
            <span>
              {distance > 1_000
                ? `${(distance / 1_000).toFixed(1)} km`
                : `${distance.toFixed(1)} m`}
            </span>
          </p>
          <p className="flex justify-between">
            执行时长: <span>{t?.toFixed(1)} min</span>
          </p>
          <p>
            <InfoCircleOutlined className="text-orange-400" /> 飞行路线仅供参考
          </p>
          <p className="flex justify-between">
            <Button
              size="small"
              onClick={() => {
                updatePointFly({
                  open: false,
                  targetPosition: null,
                })
              }}
            >
              取消
            </Button>
            <Button size="small" type="primary" onClick={handleConfirm}>
              开始执行
            </Button>
          </p>
        </div>
      </PositionTooltip>
    </>
  )
})

UavPointFlyConfirm.displayName = 'UavPointFlyConfirm'

export default UavPointFlyConfirm
