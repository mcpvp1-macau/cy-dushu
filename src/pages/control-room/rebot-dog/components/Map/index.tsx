// import CesiumMap from '@/map/CesiumMap'
// import RebotDogRealMarker from './components/RealMarker'
// import RebotDogRealTrack from './components/RealTrack'
// import TargetPoints from '@/map/GlobalMap/TargetPoints'
import PointCloudMap from '@/components/PointCloudMap/Map'
import PointCloudLayer from '@/components/PointCloudMap/PointCloudLayer'
import Marker from '@/components/PointCloudMap/Marker'
import icon from '/images/marker/icon/rebot_dog.svg'
import Polyline from '@/components/PointCloudMap/Polyline'
import Label from '@/components/PointCloudMap/Label'
import { useInterval } from 'ahooks'
import { useRebotDogControlRoomStore } from '@/store/context-store/useRebotDogControlRoom.store'
const RebotDogMap: FC<unknown> = memo(() => {
  const activeMapUrl = useRebotDogControlRoomStore((s) => s.activeMapUrl)

  const [text, setText] = useState('哈哈哈哈')
  useInterval(() => {
    setText((text) => (text === '哈哈哈哈' ? '发发地方' : '哈哈哈哈'))
  }, 1000)

  return (
    <PointCloudMap>
      {/* <PointCloudLayer url="/pcd_data/lab_avia.pcd" /> */}
      <PointCloudLayer
        url={activeMapUrl || '/pcd_data/test-2.pcd'}
        onClick={() => {}}
      />
      <Marker position={{ x: 0, y: 0, z: 0 }} image={icon} onClick={() => {}} />
      <Polyline
        positions={[
          { x: 0, y: 0, z: 0 },
          { x: 5, y: 0, z: 0 },
          // { x: -2, y: 2, z: 0 },
          // { x: 2, y: 2, z: 0 },
          // { x: 2, y: -2, z: 0 },
          // { x: -2, y: -2, z: 0 },
        ]}
        color="#ff0000"
      />
      <Label
        position={{ x: 0, y: 0, z: 0 }}
        text={text}
        offset={{ x: 0, y: 80, z: 0 }}
      />
    </PointCloudMap>
  )
  // return (
  //   <CesiumMap id="rebot-dog-control-room-map">
  //     <RebotDogRealMarker />
  //     <RebotDogRealTrack />
  //     <TargetPoints />
  //   </CesiumMap>
  // )
})

RebotDogMap.displayName = 'RebotDogMap'

export default RebotDogMap
