import { Statistic } from 'antd'
import { useUsvControlRoomStore } from '@/store/context-store/useUsvControlRoom.store'

const AttitudePanel: FC = memo(() => {
  const heading = useUsvControlRoomStore((s) => s.state.heading ?? 0)
  const pitch = useUsvControlRoomStore((s) => s.state.pitch ?? 0)
  const roll = useUsvControlRoomStore((s) => s.state.roll ?? 0)

  return (
    <div className="grid size-full grid-cols-3 gap-4 p-4">
      <Statistic title="Heading" value={heading} precision={2} suffix="°" />
      <Statistic title="Pitch" value={pitch} precision={2} suffix="°" />
      <Statistic title="Roll" value={roll} precision={2} suffix="°" />
    </div>
  )
})

AttitudePanel.displayName = 'AttitudePanel'

export default AttitudePanel
