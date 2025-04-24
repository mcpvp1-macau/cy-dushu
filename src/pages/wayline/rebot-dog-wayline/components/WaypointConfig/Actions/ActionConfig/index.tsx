import { InputNumber } from 'antd'
import useRebotDogWaylineStore from '@/store/wayline/rebot-dog-wayline/useRebotDogWayline.store'
import HoverTime from '@/pages/wayline/edit/components/AirpointConfig/Actions/ActionConfig/HoverTime'
import AppEmpty from '@/components/AppEmpty'

interface Props {
  activeOperator: string
}

const ActionConfig: FC<Props> = ({ activeOperator }) => {
  const { t } = useTranslation()
  const currentIndex = useRebotDogWaylineStore((s) => s.currentIndex)
  const currentWaypoint = useRebotDogWaylineStore(
    (s) => s.waypointsConfig[currentIndex],
  )
  const updateWaypointsConfig = useRebotDogWaylineStore(
    (s) => s.updateWaypointsConfig,
  )
  const editCurrentWaypoint = useRebotDogWaylineStore(
    (s) => s.updateCurrentWaypoint,
  )

  const actions = currentWaypoint?.actions || []

  const action = actions.find((item) => item.xid === activeOperator)

  const onChange = (config: any) => {
    editCurrentWaypoint({
      ...currentWaypoint,
      actions: actions.map((item) => {
        if (item.xid === activeOperator) {
          return {
            ...item,
            config,
          }
        }
        return item
      }),
    })
  }

  const onChangePosition = (
    type: 'pointX' | 'pointY' | 'pointZ',
    value: number,
  ) => {
    const waypointsConfig = useRebotDogWaylineStore.getState().waypointsConfig
    updateWaypointsConfig(
      waypointsConfig.map((item, index) => {
        if (currentIndex === index) {
          return {
            ...item,
            [type]: value,
          }
        }
        return item
      }),
    )
  }

  const getActionComponent = () => {
    if (!action) {
      return <AppEmpty className="m-0 mt-3" />
    }
    if (action?.type === 'HOVER') {
      return (
        <HoverTime
          config={action?.config ?? { hoverTime: 0 }}
          onChange={onChange}
        />
      )
    }
    return (
      <AppEmpty
        className="m-0 mt-3"
        description={t('wayline.action.noSupportEdit')}
      />
    )
  }

  return (
    <>
      {getActionComponent()}

      <div className="h-[1px] my-3 bg-ground-5"></div>

      <div>
        <div className="my-2">{t('common.longitude')}</div>
        <InputNumber
          value={Number(currentWaypoint?.pointX.toFixed(6) ?? 0)}
          className="w-full"
          onChange={(value: number | null) =>
            value && onChangePosition('pointX', value)
          }
        />
      </div>
      <div>
        <div className="my-2">{t('common.latitude')}</div>
        <InputNumber
          value={Number(currentWaypoint?.pointY.toFixed(6) ?? 0)}
          className="w-full"
          onChange={(value: number | null) =>
            value && onChangePosition('pointY', value)
          }
        />
      </div>
    </>
  )
}

export default ActionConfig
