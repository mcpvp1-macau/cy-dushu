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

  const canChangePostureMode = !!serviceHave['changePostureMode']
  const canChangeMoveMode = !!serviceHave['changeMoveMode']
  const canStopFire = !!serviceHave['stopFire']
  const canStartFire = !!serviceHave['startFire']
  const canStopSmoke = !!serviceHave['stopSmoke']
  const canStartSmoke = !!serviceHave['startSmoke']

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
              姿态模式
            </Button>
            <Button
              disabled={!canChangeMoveMode}
              onClick={() => {
                if (!canChangeMoveMode) return
                postDeviceService('changeMoveMode')
              }}
            >
              运动模式
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              disabled={!canStopFire}
              onClick={() => {
                if (!canStopFire) return
                postDeviceService('stopFire')
              }}
            >
              停止喷火
            </Button>
            <Button
              type="primary"
              disabled={!canStartFire}
              onClick={() => {
                if (!canStartFire) return
                postDeviceService('startFire')
              }}
            >
              开始喷火
            </Button>
            <Button
              disabled={!canStopSmoke}
              onClick={() => {
                if (!canStopSmoke) return
                postDeviceService('stopSmoke')
              }}
            >
              停止发烟
            </Button>
            <Button
              type="primary"
              disabled={!canStartSmoke}
              onClick={() => {
                if (!canStartSmoke) return
                postDeviceService('startSmoke')
              }}
            >
              开始发烟
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
})

RebotDogAsideButtons.displayName = 'RebotDogAsideButtons'

export default RebotDogAsideButtons
