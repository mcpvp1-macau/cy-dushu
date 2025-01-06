import ControlPower from '@/components/ControlPower'
import { useWangLouControlRoomStore } from '@/store/context-store/useWangLouControlRoom.store'
import RadarVisLink from './RadarVisLink'

const ControlButtons: React.FC = () => {
  const productKey = useWangLouControlRoomStore((s) => s.productKey)
  const deviceId = useWangLouControlRoomStore((s) => s.deviceId)
  const gangedSwitch = useWangLouControlRoomStore((s) => s.state.gangedSwitch)
  const controlTag = useWangLouControlRoomStore((s) => s.state.controlTag)
  const uuid = useWangLouControlRoomStore((s) => s.uuid)
  const updateUUID = useWangLouControlRoomStore((s) => s.updateUUID)

  return (
    <section className="mx-3 mr-[9px] my-3 flex gap-8 justify-center">
      <RadarVisLink
        productKey={productKey}
        deviceId={deviceId}
        status={gangedSwitch}
      />
      <ControlPower
        open={!!(uuid && uuid === controlTag)}
        updateUUID={updateUUID}
      />
    </section>
  )
}

export default ControlButtons
