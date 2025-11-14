import { useUGVControlRoomStore } from '@/store/context-store/useUGVControlRoom.store'
import { useKeyDownGroup } from '@/hooks/useKeyDownGroup'

const MOVEMENT_KEYS = ['w', 's', 'q', 'e']

const buildCommandFromKey = (
  key: string,
  params: { xSpeed: number; yawSpeed: number },
) => {
  switch (key) {
    case 'w':
      return { xSpeed: params.xSpeed }
    case 's':
      return { xSpeed: -params.xSpeed }
    case 'q':
      return { yawSpeed: params.yawSpeed }
    case 'e':
      return { yawSpeed: -params.yawSpeed }
    default:
      return {}
  }
}

const useUGVMovementControl = () => {
  const params = useUGVControlRoomStore((s) => s.params)
  const updateControlInfo = useUGVControlRoomStore(
    (s) => s.updateControlInfo,
  )

  const activeKeys = useKeyDownGroup({
    keyFilter: MOVEMENT_KEYS,
    clearOnOtherKey: true,
  })

  useEffect(() => {
    const payload = {
      xSpeed: 0,
      yawSpeed: 0,
    }
    activeKeys.forEach((key) => {
      const command = buildCommandFromKey(key, params)
      if (command.xSpeed) {
        payload.xSpeed += command.xSpeed
      }
      if (command.yawSpeed) {
        payload.yawSpeed += command.yawSpeed
      }
    })
    updateControlInfo(payload)
  }, [activeKeys.size, params.xSpeed, params.yawSpeed])
}

export default useUGVMovementControl
