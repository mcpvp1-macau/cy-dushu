import { memo, type FC } from 'react'
import GimbalSwitch from './GimbalSwitch'

type PropsType = unknown

const GimbalLeft: FC<PropsType> = memo(() => {
  return (
    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-50">
      <GimbalSwitch />
    </div>
  )
})

GimbalLeft.displayName = 'GimbalLeft'

export default GimbalLeft
