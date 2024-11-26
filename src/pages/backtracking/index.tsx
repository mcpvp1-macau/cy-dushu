import CesiumMap from '@/map/CesiumMap'
import { memo, type FC } from 'react'

type PropsType = unknown

const PageBackTracking: FC<PropsType> = memo(() => {
  return (
    <div className="absolute inset-0">
      <CesiumMap id="backtracking" />
    </div>
  )
})

PageBackTracking.displayName = 'PageBackTracking'

export default PageBackTracking
