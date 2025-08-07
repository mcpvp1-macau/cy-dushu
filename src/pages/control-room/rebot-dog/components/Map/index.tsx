// import CesiumMap from '@/map/CesiumMap'
// import RebotDogRealMarker from './components/RealMarker'
// import RebotDogRealTrack from './components/RealTrack'
// import TargetPoints from '@/map/GlobalMap/TargetPoints'
import PointCloudMap from '@/components/PointCloudMap/Map'
import PointCloudLayer from '@/components/PointCloudMap/PointCloudLayer'
import Marker from '@/components/PointCloudMap/Marker'
import icon from '/images/marker/icon/rebot_dog.svg'
import Polyline from '@/components/PointCloudMap/Polyline'
const RebotDogMap: FC<unknown> = memo(() => {
  return (
    <PointCloudMap>
      {/* <PointCloudLayer url="/pcd_data/lab_avia.pcd" /> */}
      <PointCloudLayer
        url="/pcd_data/output_ascii_deskewed.pcd"
        onClick={() => {}}
      />
      <Marker
        position={{ x: 0, y: 0, z: 0 }}
        image={icon}
        onClick={() => {}}
      />
      <Polyline
        positions={[
          { x: 0, y: 0, z: 0 },
          { x: 1, y: 1, z: 0 },
          { x: -2, y: 2, z: 0 },
          { x: 2, y: 2, z: 0 },
          { x: 2, y: -2, z: 0 },
          { x: -2, y: -2, z: 0 },
        ]}
        color="#ff0000"
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
