import IconButton from '@/components/ui/button/IconButton'
import ControlPower from './ControlPower'
import IconTakePhoto from '@/assets/icons/jsx/uav/IconTakePhoto'
import { Button } from 'antd'
import usePostDeviceService from '@/pages/right/DeviceDetail/hooks/usePostDeviceService'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { useRebotDogControlRoomStore } from '@/store/context-store/useRebotDogControlRoom.store'
import PointAction from './PointAction'

/** 侧边按钮们 */
const RebotDogAsideButtons: FC<unknown> = memo(() => {
  const postDeviceService = usePostDeviceService()

  const dogMode = useRebotDogControlRoomStore((s) => s.state.dogMode)
  const serviceHave = useDeviceDetailStore((s) => s.serviceHave)
  const { t } = useTranslation()

  const canChangePostureMode = !!serviceHave['changePostureMode']
  const canChangeMoveMode = !!serviceHave['changeMoveMode']
  const canSwitchLMode = !!serviceHave['switchToLMode']
  const fireAndSmokeButtons = useMemo(
    () =>
      [
        {
          key: 'stopFire',
          label: '停止喷火',
          type: 'default' as const,
          enabled: !!serviceHave['stopFire'],
        },
        {
          key: 'startFire',
          label: '开始喷火',
          type: 'primary' as const,
          enabled: !!serviceHave['startFire'],
        },
        {
          key: 'stopSmoke',
          label: '停止发烟',
          type: 'default' as const,
          enabled: !!serviceHave['stopSmoke'],
        },
        {
          key: 'startSmoke',
          label: '开始发烟',
          type: 'primary' as const,
          enabled: !!serviceHave['startSmoke'],
        },
      ].filter((item) => item.enabled),
    [serviceHave],
  )

  return (
    <div className="absolute inset-0 flex justify-center items-center">
      <div className="p-2 w-full max-w-[400px]">
        <div className="flex flex-col gap-2">
          <div>
            <IconButton
              onClick={() => {
                postDeviceService('takePhoto')
              }}
            >
              <IconTakePhoto />
            </IconButton>
          </div>
          <ControlPower />
          <div className="flex gap-2">
            <PointAction />
            <Button
              className="flex-1"
              type={dogMode === 3 ? 'primary' : 'default'}
              onClick={() => {
                postDeviceService(
                  dogMode === 3 ? 'stopClimbStairs' : 'startClimbStairs',
                )
              }}
            >
              爬梯模式
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                postDeviceService('actionStopMove')
              }}
            >
              紧急停止
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              disabled={!canChangePostureMode}
              onClick={() => {
                if (!canChangePostureMode) return
                postDeviceService('changePostureMode')
              }}
            >
              {t('controlRoom.rebotDog.mode.posture', { defaultValue: '姿态模式' })}
            </Button>
            <Button
              disabled={!canChangeMoveMode}
              onClick={() => {
                if (!canChangeMoveMode) return
                postDeviceService('changeMoveMode')
              }}
            >
              {t('controlRoom.rebotDog.mode.move', { defaultValue: '运动模式' })}
            </Button>
            <Button
              disabled={!canSwitchLMode}
              onClick={() => {
                if (!canSwitchLMode) return
                postDeviceService('switchToLMode', { isLMode: true })
              }}
            >
              {t('controlRoom.rebotDog.mode.enterReinforcement', {
                defaultValue: '进入强化学习模式',
              })}
            </Button>
            <Button
              disabled={!canSwitchLMode}
              onClick={() => {
                if (!canSwitchLMode) return
                postDeviceService('switchToLMode', { isLMode: false })
              }}
            >
              {t('controlRoom.rebotDog.mode.exitReinforcement', {
                defaultValue: '退出强化学习模式',
              })}
            </Button>
          </div>
          {fireAndSmokeButtons.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {fireAndSmokeButtons.map((item) => (
                <Button
                  key={item.key}
                  type={item.type}
                  onClick={() => {
                    postDeviceService(item.key)
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

RebotDogAsideButtons.displayName = 'RebotDogAsideButtons'

export default RebotDogAsideButtons
