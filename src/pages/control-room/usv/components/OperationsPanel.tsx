import { Button, Tooltip } from 'antd'
import { useUsvControlRoomStore } from '@/store/context-store/useUsvControlRoom.store'

const OperationsPanel: FC = memo(() => {
  const hasControlPower = useUsvControlRoomStore((s) => s.hasControlPower)
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
      <Tooltip title={hasControlPower ? undefined : '需要控制权'}>
        <Button
          type={pointSailOpen ? 'primary' : 'default'}
          disabled={!hasControlPower}
          onClick={togglePointSail}
        >
          指点航行
        </Button>
      </Tooltip>
    </div>
  )
})

OperationsPanel.displayName = 'OperationsPanel'

export default OperationsPanel
