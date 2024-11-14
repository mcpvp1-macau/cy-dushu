import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { isNil } from 'lodash'
import { useShallow } from 'zustand/react/shallow'

type PropsType = unknown

/** 避障 */
const Avoidance: FC<PropsType> = memo(() => {
  const baseCls = 'absolute animate-pulse duration-500'

  const avoidDistances = useUavControlRoomStore(
    useShallow((s) => [
      s.state.frontAvoidDistance,
      s.state.backAvoidDistance,
      s.state.leftAvoidDistance,
      s.state.rightAvoidDistance,
    ]),
  )

  const open = avoidDistances.some((e) => !isNil(e) && e >= 0 && e < 15)

  if (!open) {
    return null
  }

  return (
    <div className="absolute inset-0 pointer-events-none select-none opacity-50">
      <div
        className={clsx(
          baseCls,
          'inset-x-0 top-0 h-7 bg-gradient-to-b from-red-500 to-transparent',
        )}
      ></div>
      <div
        className={clsx(
          baseCls,
          'inset-x-0 bottom-0 h-7 bg-gradient-to-t from-red-500 to-transparent',
        )}
      ></div>
      <div
        className={clsx(
          baseCls,
          'inset-y-0 left-0 w-7 bg-gradient-to-r from-red-500 to-transparent',
        )}
      ></div>
      <div
        className={clsx(
          baseCls,
          'inset-y-0 right-0 w-7 bg-gradient-to-l from-red-500 to-transparent',
        )}
      ></div>
    </div>
  )
})

Avoidance.displayName = 'Avoidance'

export default Avoidance
