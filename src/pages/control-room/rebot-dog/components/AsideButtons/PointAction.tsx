import { FC } from 'react'
import { Button } from 'antd'
import { useRebotDogControlRoomStore } from '@/store/context-store/useRebotDogControlRoom.store'

const PointAction: FC = () => {
  const pointAction = useRebotDogControlRoomStore((s) => s.pointAction)

  const updatePointAction = useRebotDogControlRoomStore(
    (s) => s.updatePointAction,
  )

  return (
    <>
      <Button
        className={pointAction.open ? 'text-primary flex-1' : 'flex-1'}
        onClick={() => {
          updatePointAction({
            open: !pointAction.open,
            targetPosition: undefined,
          })
        }}
      >
        指点前进
      </Button>
    </>
  )
}

export default PointAction
