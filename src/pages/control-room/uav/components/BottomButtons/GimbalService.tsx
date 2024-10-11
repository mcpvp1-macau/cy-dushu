import FloatIconButton from '@/components/ui/button/FloatIconButton'
import { Dropdown, Tooltip } from 'antd'
import gimbalBottom from '@/assets/imgs/control/gimbalBottom.png'
import gimbalMiddle from '@/assets/imgs/control/gimbalMiddle.png'
import gimbalPitchBottom from '@/assets/imgs/control/gimbalPitchBottom.png'
import gimbalYawMiddle from '@/assets/imgs/control/gimbalYawMiddle.png'
import follow from '@/assets/imgs/control/follow.png'
import freedom from '@/assets/imgs/control/freedom.png'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { usePostDeviceService } from '@/hooks/device/usePostDeviceService'

type PropsType = unknown

const GimbalService: FC<PropsType> = memo(() => {
  const gimbalMode = useUavControlRoomStore((s) => s.state.gimbalMode)

  const productKey = useDeviceDetailStore((s) => s.productKey)
  const deviceId = useDeviceDetailStore((s) => s.deviceId)

  const postService = usePostDeviceService(productKey, deviceId)

  const handleClick = useMemoizedFn(({ key }) => {
    const data =
      key !== 'setGimbalMode'
        ? {}
        : { mode: gimbalMode === 'free' ? 'follow' : 'free' }
    postService(key, data)
  })

  return (
    <Dropdown
      placement="top"
      menu={{
        onClick: handleClick,
        items: [
          {
            key: 'resetGimbal',
            label: (
              <Tooltip title="云台回中" placement="right">
                <img src={gimbalMiddle} className="w-6" />
              </Tooltip>
            ),
          },
          {
            key: 'resetGimbalToDown',
            label: (
              <Tooltip title="云台朝下" placement="right">
                <img src={gimbalBottom} className="w-6" />
              </Tooltip>
            ),
          },
          {
            key: 'resetGimbalYaw',
            label: (
              <Tooltip title="云台偏航回中" placement="right">
                <img src={gimbalYawMiddle} className="w-6" />
              </Tooltip>
            ),
          },
          {
            key: 'resetGimbalPitchToDown',
            label: (
              <Tooltip title="云台俯仰朝下" placement="right">
                <img src={gimbalPitchBottom} className="w-6" />
              </Tooltip>
            ),
          },
          {
            key: 'setGimbalMode',
            label: (
              <Tooltip
                title={gimbalBottom === 'free' ? '跟踪模式' : '自由模式'}
                placement="right"
              >
                <img
                  src={gimbalMode === 'free' ? follow : freedom}
                  className="w-6"
                />
              </Tooltip>
            ),
          },
        ],
      }}
    >
      <FloatIconButton className="scale-90">
        <img
          src={gimbalMode === 'free' ? freedom : follow}
          className="w-6 h-6 mx-auto"
        />
      </FloatIconButton>
    </Dropdown>
  )
})

GimbalService.displayName = 'GimbalService'

export default GimbalService
