import { Button } from 'antd'
import { useUsvControlRoomStore } from '@/store/context-store/useUsvControlRoom.store'

const OperationsPanel: FC = memo(() => {
  const pointSailOpen = useUsvControlRoomStore((s) => s.pointSail.open)
  const updatePointSail = useUsvControlRoomStore((s) => s.updatePointSail)

  const togglePointSail = () => {
    updatePointSail({
      open: !pointSailOpen,
      targetPosition: null,
    })
  }

  return (
    <div className="flex size-full items-center justify-start gap-3 px-4">
      <Button type={pointSailOpen ? 'primary' : 'default'} onClick={togglePointSail}>
        指点航行
      </Button>
    </div>
  )
})

OperationsPanel.displayName = 'OperationsPanel'

export default OperationsPanel
