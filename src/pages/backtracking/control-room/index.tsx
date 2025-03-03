import BackTrackingUavControlRoom from './uav'
import BackTrackingWanglouControlRoom from './wanglou'

const BackTrackingControlRoom: React.FC = () => {
  const deviceType = useParams().deviceType

  if (deviceType === 'uav') {
    return <BackTrackingUavControlRoom />
  } else if (deviceType === 'wanglou') {
    return <BackTrackingWanglouControlRoom />
  }
  return <>{deviceType}</>
}

export default BackTrackingControlRoom
