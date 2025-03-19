import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers'
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
} from '@dnd-kit/sortable'
import ActionRowItem from './Item'

type PropsType = {
  data: string[]
  activeId: string
  contentMap?: Record<string, ReactNode>
  onChangeActiveId: (id: string) => void
  onChangeData: (data: string[]) => void
}

const ActionRow: FC<PropsType> = ({
  data,
  activeId,
  contentMap,
  onChangeActiveId,
  onChangeData,
}) => {
  const sensors = useSensors(useSensor(PointerSensor, {}))

  const handleDragStart = (event: DragStartEvent) => {
    onChangeActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || !active) {
      return
    }
    const oldIndex = data.findIndex((item) => item === active.id)
    const newIndex = data.findIndex((item) => item === over.id)
    if (active.id !== over.id) {
      onChangeData(arrayMove(data, oldIndex, newIndex))
    } else {
      onChangeActiveId(data[oldIndex])
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToHorizontalAxis]}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
    >
      <SortableContext items={data} strategy={horizontalListSortingStrategy}>
        {data.map((item) => (
          <ActionRowItem
            key={item}
            id={item}
            activeId={activeId}
            children={contentMap?.[item]}
            onDelete={() => {
              onChangeData(data.filter((v) => v !== item))
            }}
          />
        ))}
      </SortableContext>
    </DndContext>
  )
}

ActionRow.displayName = 'ActionRow'

export default ActionRow
