import IconRefresh from '@/assets/icons/jsx/IconRefresh'
import IconButton from '@/components/ui/button/IconButton'
import {
  useUavControlRoomStore,
  useUavControlRoomStoreInstance,
} from '@/store/context-store/useUavControlRoom.store'
import { InputNumber } from 'antd'
import { isNil } from 'lodash'

type PropsType = unknown

const ControlParamsSetting: FC<PropsType> = memo(() => {
  const { t } = useTranslation()
  const yawSpeed = useUavControlRoomStore((s) => s.flyParams.gimbalYawSpeed)
  const pitchSpeed = useUavControlRoomStore((s) => s.flyParams.gimbalPitchSpeed)

  const store = useUavControlRoomStoreInstance()

  const handleChangeSpeed = (
    speed: number | null,
    type: 'gimbalYawSpeed' | 'gimbalPitchSpeed',
  ) => {
    if (isNil(speed)) {
      return
    }
    const state = store.getState()
    const updatedParams = {
      ...state.flyParams,
      [type]: speed,
    }
    state.updateFlyParams(updatedParams)
  }

  return (
    <div className="text-sm p-3 flex flex-col gap-2 size-full">
      <div className="flex items-center gap-2">
        <span className="w-1/2">
          {t('controlRoom.uav.controlParams.gimbalYawSpeed')}
        </span>
        <InputNumber
          className="flex-1"
          size="small"
          suffix="°/s"
          value={yawSpeed}
          min={0.1}
          max={15}
          addonAfter={
            <IconButton
              className="mx-1 scale-90"
              onClick={() => handleChangeSpeed(10, 'gimbalYawSpeed')}
            >
              <IconRefresh />
            </IconButton>
          }
          onChange={(v) => handleChangeSpeed(v, 'gimbalYawSpeed')}
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-1/2">
          {t('controlRoom.uav.controlParams.gimbalPitchSpeed')}
        </span>
        <InputNumber
          className="flex-1"
          size="small"
          suffix="°/s"
          value={pitchSpeed}
          min={0.1}
          max={15}
          addonAfter={
            <IconButton
              className="mx-1 scale-90"
              onClick={() => handleChangeSpeed(10, 'gimbalPitchSpeed')}
            >
              <IconRefresh />
            </IconButton>
          }
          onChange={(v) => handleChangeSpeed(v, 'gimbalPitchSpeed')}
        />
      </div>
    </div>
  )
})

ControlParamsSetting.displayName = 'ControlParamsSetting'

export default ControlParamsSetting
