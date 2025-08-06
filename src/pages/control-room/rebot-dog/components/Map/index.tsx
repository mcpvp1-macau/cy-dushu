// import CesiumMap from '@/map/CesiumMap'
// import RebotDogRealMarker from './components/RealMarker'
// import RebotDogRealTrack from './components/RealTrack'
// import TargetPoints from '@/map/GlobalMap/TargetPoints'
import PointCloudMap from '@/components/PointCloudMap/Map'
import PointCloudLayer from '@/components/PointCloudMap/PointCloudLayer'
const RebotDogMap: FC<unknown> = memo(() => {
  console.log('RebotDogMap1')
  // return <div className="h-full w-full">123</div>
  return (
    <PointCloudMap>
      <PointCloudLayer url="/pcd_data/lab_avia.pcd" />
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

// RebotDogMap.displayName = 'RebotDogMap'

export default RebotDogMap
