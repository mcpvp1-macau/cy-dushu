import CesiumMap from '@/map/CesiumMap'
import BigFlyListener from '@/map/GlobalMap/BigFlyListener'
import { memo, type FC } from 'react'

type PropsType = unknown

const PageBackTracking: FC<PropsType> = memo(() => {
  return (
    <div className="absolute inset-0">
      <CesiumMap id="backtracking" >
        <BigFlyListener />
      </CesiumMap>
    </div>
  )
})

PageBackTracking.displayName = 'PageBackTracking'

export default PageBackTracking
