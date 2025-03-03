import CesiumMap from '@/map/CesiumMap'
import { memo, type FC } from 'react'
import TimelineWarpper from './TimelineWarpper'
import TargetBacktracking from '../target'
import BackTrackingPath from './BackTrackingPath'
import WangLouDetailMarker from './wanglou/WangLouDetailMarker'

type PropsType = {
  isControlRoom?: boolean
}

/** 设备回溯 */
const BackTrackingMap: FC<PropsType> = memo(() => {
  const deviceId = useParams().deviceId
  const deviceType = useParams().deviceType
  return (
    <CesiumMap id="backtracking">
      {deviceType === 'uav' && <BackTrackingPath deviceId={deviceId!} />}
      <div className="absolute bottom-3 left-3 right-14 z-50">
        <TimelineWarpper />
      </div>
      {deviceType === 'wanglou' && <TargetBacktracking deviceId={deviceId!} />}
      {deviceType === 'wanglou' && <WangLouDetailMarker />}
    </CesiumMap>
  )
})

BackTrackingMap.displayName = 'BackTrackingMap'

export default BackTrackingMap
