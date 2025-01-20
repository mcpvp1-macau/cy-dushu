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
    <div className="absolute inset-0 pointer-events-none select-none">
      <div className="absolute inset-0 opacity-50">
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
      <div
        className="absolute inset-0 text-fore bg-opacity-70 text-sm"
        style={{ textShadow: '0 0 1px red' }}
      >
        {(avoidDistances[0] ?? 0x3f) < 15 && avoidDistances[0]! > 0 && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2">
            {avoidDistances[0]!.toFixed(1)} m
          </div>
        )}
        {(avoidDistances[1] ?? 0x3f) < 15 && avoidDistances[1]! > 0 && (
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
            {avoidDistances[1]!.toFixed(1)} m
          </div>
        )}
        {(avoidDistances[2] ?? 0x3f) < 15 && avoidDistances[2]! > 0 && (
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2"
            style={{
              writingMode: 'vertical-rl',
            }}
          >
            {avoidDistances[2]!.toFixed(1)} m
          </div>
        )}
        {(avoidDistances[3] ?? 0x3f) < 15 && avoidDistances[3]! > 0 && (
          <div
            className="absolute right-0 top-1/2 -translate-y-1/2"
            style={{
              writingMode: 'vertical-rl',
            }}
          >
            {avoidDistances[3]!.toFixed(1)} m
          </div>
        )}
      </div>
    </div>
  )
})

Avoidance.displayName = 'Avoidance'

export default Avoidance
