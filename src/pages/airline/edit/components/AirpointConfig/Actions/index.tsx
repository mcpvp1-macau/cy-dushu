import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable'
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers'
import SortableItem from './SortableItem'
import useAirlineConfigStore from '@/store/uav/uav-airline/useAirlineConfig.store'
import { useCurrentAirpoint } from '@/store/uav/uav-airline/select'

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
  const SortableContextItems = actions.map((item) => item.xid)

  const sensors = useSensors(useSensor(PointerSensor, {}))

  const handleDragStart = (event: any) => {
    setActiveOperator(event.active.id)
  }

  const handleDragEnd = (event: any) => {
    const { active, over } = event
    if (!over || !active) {
      return
    }
    const oldIndex = actions.findIndex((item) => item.xid === active.id)
    const newIndex = actions.findIndex((item) => item.xid === over.id)
    const airpointsConfig = useAirlineConfigStore.getState().airpointsConfig
    if (active.id !== over.id) {
      setAirpointsConfig(
        airpointsConfig.map((item, i) => {
          if (currentIndex === i) {
            return {
              ...item,
              actions: arrayMove(item.actions, oldIndex, newIndex),
            }
          }
          return item
        }),
      )
    } else {
      setActiveOperator(actions[Number(oldIndex)].xid)
      setCurrentActionIndex(Number(oldIndex))
    }
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        modifiers={[restrictToHorizontalAxis]}
      >
        <SortableContext
          items={SortableContextItems}
          strategy={horizontalListSortingStrategy}
        >
          {actions.map((item) => (
            <SortableItem
              key={item.xid}
              id={item.xid}
              action={item}
              activeOperator={activeOperator}
              setActiveOperator={setActiveOperator}
            />
          ))}
        </SortableContext>
      </DndContext>
    </>
  )
}

export default Actions
