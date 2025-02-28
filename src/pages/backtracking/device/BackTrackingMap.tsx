import CesiumMap from '@/map/CesiumMap'
import { memo, type FC } from 'react'
import TimelineWarpper from './TimelineWarpper'
import TargetBacktracking from '../target'
import BackTrackingPath from './BackTrackingPath'

type PropsType = {
  isControlRoom?: boolean
}

/** 设备回溯 */
const BackTrackingMap: FC<PropsType> = memo(() => {
  const deviceId = useParams().deviceId

  return (
    <CesiumMap id="backtracking">
      <BackTrackingPath deviceId={deviceId!} />
      <div className="absolute bottom-3 left-3 right-14 z-50">
        <TimelineWarpper />
      </div>
      <TargetBacktracking deviceId={deviceId!} />
    </CesiumMap>
  )
})

BackTrackingMap.displayName = 'BackTrackingMap'

export default BackTrackingMap
