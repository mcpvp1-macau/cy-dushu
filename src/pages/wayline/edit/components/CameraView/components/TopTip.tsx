import useAirlineConfigStore from '@/store/wayline/uav-airline/useAirlineConfig.store'
import { floor } from 'lodash'
import { memo, type FC } from 'react'

type PropsType = {
  type: 'wide' | 'narrow'
}

const TopTip: FC<PropsType> = memo(({ type }) => {
  const eoFovMultiplier =
    useAirlineConfigStore((s) => s.uav.eoFovMultiplier) ?? 2
  const text = floor(eoFovMultiplier, 1)

  return (
    <div
      className={clsx(
        'absolute top-3 border border-solid left-1/2 py-0.5 px-1 shadow-inner pointer-events-none',
        {
          'border-green-400 text-green-400': type === 'narrow',
          'border-neutral-100 text-neutral-100': type === 'wide',
        },
      )}
      style={{ transform: 'translateX(-50%)', textShadow: '1px 1px 1px #0009' }}
    >
      <p className="flex gap-1">
        <span>{{ wide: '广角', narrow: '变焦' }[type]}</span>
        <span>{{ wide: 1, narrow: text }[type]}X</span>
      </p>
    </div>
  )
})

TopTip.displayName = 'TopTip'

export default TopTip
