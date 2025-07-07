import { actionKeys, actionMap, ActionTypeEnum, iconMap } from './actionMap'
import { v4 as uuidv4 } from 'uuid'
import { useAppMsg } from '@/hooks/useAppMsg'
import useAirlineConfigStore from '@/store/wayline/uav-airline/useAirlineConfig.store'
import { useCurrentAirpoint } from '@/store/wayline/uav-airline/select'
import IconButtonWithDropDown from '@/components/ui/button/IconButtonWithDropDown'
import IconPlus from '@/assets/icons/jsx/IconPlus'
import { ItemType } from 'antd/es/menu/interface'

type PropsType = {
  setActiveOperator: React.Dispatch<React.SetStateAction<string>>
}

/** 航点添加动作 */
const AirpointAddAction: FC<PropsType> = memo(({ setActiveOperator }) => {
  const msgApi = useAppMsg()
  const { t, i18n } = useTranslation()

  const currentBearing = useAirlineConfigStore((s) => s.bearing)
  const eoBearingDelta = useAirlineConfigStore((s) => s.eoBearingDealta)
  const eoPitch = useAirlineConfigStore((s) => s.eoPitch)
  const fovMultipiler = useAirlineConfigStore((s) => s.fovMultipiler)

  const editCurrentAirPoint = useAirlineConfigStore(
    (s) => s.updateCurrentAirpoint,
  )

  const setCurrentActionIndex = useAirlineConfigStore(
    (s) => s.updateCurrentActionIndex,
  )

  const currentAirPoint = useCurrentAirpoint()

  const addAction = useMemoizedFn((type: ActionTypeEnum) => {
    const xid = uuidv4()
    const action = actionMap.get(type) as any
    if (!action) {
      msgApi.error('未找到对应的动作')
      return
    }
    if (type === ActionTypeEnum.ROTATE_YAW) {
      action.config = { aircraftHeading: currentBearing || 0 }
    } else if (type === ActionTypeEnum.CAMERA_POSITION_X) {
      action.config = { x: (currentBearing || 0) + (eoBearingDelta || 0) }
    } else if (type === ActionTypeEnum.CAMERA_POSITION_Y) {
      action.config = { y: eoPitch || 0 }
    } else if (type === ActionTypeEnum.ZOOM) {
      action.config = { focalLength: fovMultipiler || 5 }
    } else if (type === ActionTypeEnum.LEN_CHANGE) {
      action.config = {
        actionTiming: 'ARRIVE',
        videoType: 'wide',
      }
    } else if (
      type === ActionTypeEnum.OPEN_AI ||
      type === ActionTypeEnum.CLOSE_AI
    ) {
      action.config = { actionTiming: 'ARRIVE' }
    } else if (type === ActionTypeEnum.SPEAKER_PLAY) {
      action.config = {
        action: 'start', // start 开始播放 stop 停止播放
        mode: 'single', // single 单次播放 loop 循环播放
        text: '',
        volume: 100, // 音量
      }
    }

    editCurrentAirPoint({
      ...currentAirPoint,
      actions: [
        ...currentAirPoint.actions,
        {
          ...action,
          xid,
        },
      ],
    })
    setActiveOperator(xid)
    setCurrentActionIndex(currentAirPoint.actions.length)
  })

  // 添加航点动作菜单
  const menus = useMemo(
    () =>
      actionKeys.map<ItemType>((e) => ({
        key: e,
        label: (
          <div className="flex gap-2">
            {iconMap.get(e)}
            <span>
              {t(`wayline.waylinePoint.actions.${actionMap.get(e)?.key}.title`)}
            </span>
          </div>
        ),
        onClick: () => addAction(e),
      })),
    [i18n.language],
  )

  return (
    <IconButtonWithDropDown
      className="my-2"
      menu={{ items: menus }}
      tooltipProps={{
        title: t('wayline.waylinePoint.createWaypointAction.title'),
        mouseEnterDelay: 0.5,
      }}
      trigger={['click']}
      placement="bottomRight"
    >
      <IconPlus />
    </IconButtonWithDropDown>
  )
})

AirpointAddAction.displayName = 'AirpointAddAction'

export default AirpointAddAction
