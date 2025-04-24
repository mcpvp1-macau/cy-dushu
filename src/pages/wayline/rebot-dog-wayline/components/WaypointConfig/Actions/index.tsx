import { emtpyArray } from '@/constant/data'
import useRebotDogWaylineStore from '@/store/wayline/rebot-dog-wayline/useRebotDogWayline.store'
import { ActionConfigType, getIcon } from './action.constant'
import ActionRow from '@/pages/wayline/components/ActionRow'

type PropsType = {
  activeOperator: string
  setActiveOperator: (operator: string) => void
}

const Actions: FC<PropsType> = ({ activeOperator, setActiveOperator }) => {
  const currentIndex = useRebotDogWaylineStore((s) => s.currentIndex)
  const currentWaypoint = useRebotDogWaylineStore(
    (s) => s.waypointsConfig[currentIndex],
  )
  const actions = currentWaypoint?.actions || emtpyArray
  const updateWaypointsConfig = useRebotDogWaylineStore(
    (s) => s.updateWaypointsConfig,
  )

  const setCurrentActionIndex = useRebotDogWaylineStore(
    (s) => s.updateCurrentActionIndex,
  )

  const contentMap = useMemo(() => {
    return actions.reduce((acc, item) => {
      acc[item.xid] = getIcon(item)
      return acc
    }, {} as Record<string, ReactNode>)
  }, [actions])

  const handleChangeData = (newIds: string[]) => {
    const waypointsConfig = useRebotDogWaylineStore.getState().waypointsConfig
    const map = actions.reduce((acc, item) => {
      acc[item.xid] = item
      return acc
    }, {} as Record<string, ActionConfigType>)
    const waypointsConfig2 = waypointsConfig.map((item, i) => {
      if (currentIndex === i) {
        return { ...item, actions: newIds.map((id) => map[id]) }
      }
      return item
    })
    updateWaypointsConfig(waypointsConfig2)
  }

  return (
    <ActionRow
      data={actions.map((item) => item.xid)}
      activeId={activeOperator}
      contentMap={contentMap}
      onChangeActiveId={(id) => {
        setActiveOperator(id)
        setCurrentActionIndex(actions.findIndex((item) => item.xid === id))
      }}
      onChangeData={handleChangeData}
    />
  )
}

Actions.displayName = 'Actions'

export default Actions
