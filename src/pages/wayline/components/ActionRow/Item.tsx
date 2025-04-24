import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Dropdown, MenuProps } from 'antd'

type PropsType = {
  id: string
  children: ReactNode
  activeId: string
  onDelete?: () => void
}

const ActionRowItem: FC<PropsType> = ({ id, children, activeId, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const { t } = useTranslation()

  let transition2 = transition
  if (transition2 === 'transform 0ms linear') {
    transition2 = undefined
  }
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition2,
    cursor: 'move',
    ...(isDragging ? { position: 'relative', zIndex: 99999 } : {}),
  }

  const items: MenuProps['items'] = [
    {
      key: 0,
      label: (
        <div
          onClick={(e) => {
            e.stopPropagation()
            onDelete?.()
          }}
        >
          {t('common.delete')}
        </div>
      ),
    },
  ]

  return (
    <Dropdown menu={{ items }} trigger={['contextMenu']}>
      <div
        id={id}
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
      >
        <div
          className={clsx([
            'size-5 text-center leading-5 rounded',
            {
              'bg-primary text-white': id === activeId,
            },
          ])}
        >
          {children}
        </div>
      </div>
    </Dropdown>
  )
}

export default ActionRowItem
