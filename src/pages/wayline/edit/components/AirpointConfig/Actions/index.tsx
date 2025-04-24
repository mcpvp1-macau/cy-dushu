import useAirlineConfigStore from '@/store/wayline/uav-airline/useAirlineConfig.store'
import { useCurrentAirpoint } from '@/store/wayline/uav-airline/select'
import ActionRow from '@/pages/wayline/components/ActionRow'
import { ActionType } from '@/store/wayline/uav-airline/types'
import { getIcon } from './actionMap'

interface Props {
  activeOperator: string
  setActiveOperator: React.Dispatch<React.SetStateAction<string>>
}

const Actions: React.FC<Props> = ({ activeOperator, setActiveOperator }) => {
  const currentIndex = useAirlineConfigStore((s) => s.currentIndex)
  const currentAirPoint = useCurrentAirpoint()
  const actions = currentAirPoint?.actions || []
  const setAirpointsConfig = useAirlineConfigStore(
    (s) => s.updateAirpointsConfig,
  )

  const setCurrentActionIndex = useAirlineConfigStore(
    (s) => s.updateCurrentActionIndex,
  )

  const contentMap = useMemo(() => {
    return actions.reduce((acc, item) => {
      acc[item.xid] = getIcon(item)
      return acc
    }, {} as Record<string, ReactNode>)
  }, [actions])

  const handleChangeData = (newIds: string[]) => {
    const airpointsConfig = useAirlineConfigStore.getState().airpointsConfig
    const map = actions.reduce((acc, item) => {
      acc[item.xid] = item
      return acc
    }, {} as Record<string, ActionType>)
    const airpointsConfig2 = airpointsConfig.map((item, i) => {
      if (currentIndex === i) {
        return { ...item, actions: newIds.map((id) => map[id]) }
      }
      return item
    })
    setAirpointsConfig(airpointsConfig2)
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

export default Actions
