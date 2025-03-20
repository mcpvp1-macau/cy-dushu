import {
  actionKeys,
  actionMap,
  ActionTypeEnum,
  iconMap,
} from './action.constant'
import { v4 as uuidv4 } from 'uuid'
import { useAppMsg } from '@/hooks/useAppMsg'
import IconButtonWithDropDown from '@/components/ui/button/IconButtonWithDropDown'
import IconPlus from '@/assets/icons/jsx/IconPlus'
import { ItemType } from 'antd/es/menu/interface'
import useRebotDogWaylineStore from '@/store/wayline/rebot-dog-wayline/useRebotDogWayline.store'

type PropsType = {
  setActiveOperator: React.Dispatch<React.SetStateAction<string>>
}

/** 航点添加动作 */
const AddAction: FC<PropsType> = memo(({ setActiveOperator }) => {
  const msgApi = useAppMsg()
  const { t, i18n } = useTranslation()

  const updateCurrentWaypoint = useRebotDogWaylineStore(
    (s) => s.updateCurrentWaypoint,
  )

  const updateCurrentActionIndex = useRebotDogWaylineStore(
    (s) => s.updateCurrentActionIndex,
  )

  const currentWaypoint = useRebotDogWaylineStore(
    (s) => s.waypointsConfig[s.currentIndex],
  )

  const addAction = useMemoizedFn((type: ActionTypeEnum) => {
    const xid = uuidv4()
    const action = actionMap.get(type) as any
    if (!action) {
      msgApi.error('未找到对应的动作')
      return
    }

    updateCurrentWaypoint({
      ...currentWaypoint,
      actions: [
        ...currentWaypoint.actions,
        {
          ...action,
          xid,
        },
      ],
    })
    setActiveOperator(xid)
    updateCurrentActionIndex(currentWaypoint.actions.length)
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

AddAction.displayName = 'AddAction'

export default AddAction
