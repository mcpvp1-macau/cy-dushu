import IconButton from '@/components/ui/button/IconButton'
import ControlPower from './ControlPower'
import IconTakePhoto from '@/assets/icons/jsx/uav/IconTakePhoto'
import { Button } from 'antd'
import usePostDeviceService from '@/pages/right/DeviceDetail/hooks/usePostDeviceService'

/** 侧边按钮们 */
const RebotDogAsideButtons: FC<unknown> = memo(() => {
  const postDeviceService = usePostDeviceService()

  return (
    <div className="absolute inset-0 flex justify-center items-center">
      <div className="p-2 w-full max-w-[400px]">
        <div className="flex flex-col gap-2">
          <div>
            <IconButton>
              <IconTakePhoto />
            </IconButton>
          </div>
          <ControlPower />
          <div className="flex gap-2">
            <Button
              className="flex-1"
              onClick={() => {
                postDeviceService('actionWorship')
              }}
            >
              拜年
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
        </div>
      </div>
    </div>
  )
})

RebotDogAsideButtons.displayName = 'RebotDogAsideButtons'

export default RebotDogAsideButtons
