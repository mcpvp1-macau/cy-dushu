// import CesiumMap from '@/map/CesiumMap'
// import RebotDogRealMarker from './components/RealMarker'
// import RebotDogRealTrack from './components/RealTrack'
// import TargetPoints from '@/map/GlobalMap/TargetPoints'
import PointCloudLayer from '@/components/PointCloudMap/PointCloudLayer'
import { useRebotDogControlRoomStore } from '@/store/context-store/useRebotDogControlRoom.store'
import { Canvas, ThreeEvent } from '@react-three/fiber'
import { Html, OrthographicCamera } from '@react-three/drei'
import { Fragment } from 'react'
import * as THREE from 'three'
import { Vector3 } from 'three'
import PointActionMap from './PointActionMap'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'

const RebotDogMap: FC<unknown> = memo(() => {
  const x = useRebotDogControlRoomStore((s) => s.state.x || 0)
  const y = useRebotDogControlRoomStore((s) => s.state.y || 0)
  const z = useRebotDogControlRoomStore((s) => s.state.z || 0)
  const deviceName = useDeviceDetailStore((s) => s.deviceDetail?.deviceName)

  const activeMapUrl = useRebotDogControlRoomStore((s) => s.activeMapUrl)
  const pointAction = useRebotDogControlRoomStore((s) => s.pointAction)
  const updatePointAction = useRebotDogControlRoomStore(
    (s) => s.updatePointAction,
  )

  const onClick = (event: ThreeEvent<MouseEvent>) => {
    console.log(event.point)
    if (pointAction.open) {
      updatePointAction({
        open: true,
        targetPosition: [event.point.x, event.point.y, event.point.z],
        confirm: true,
      })
    }
  }

  return (
    <Canvas>
      <OrthographicCamera up={[0, 0, 1]} />
      <PointCloudLayer
        url={activeMapUrl || '/pcd_data/test (1).pcd'}
        meshProps={{ onClick }}
      />
      <Fragment>
        {/* <sprite scale={0.05} position={new Vector3(x, y, z)}>
          <spriteMaterial
            sizeAttenuation={false}
            map={new THREE.TextureLoader().load(
              '/images/marker/icon/rebot_dog.svg',
            )}
            depthTest={false}
          ></spriteMaterial>
        </sprite> */}
        <Html position={new Vector3(x, y, z)} center>
          <div className="" style={{ width: '20px', height: '20px' }}>
            <img src="/images/marker/icon/rebot_dog.svg" alt="" />
          </div>
        </Html>
        <Html position={new Vector3(x, y, z)} center>
          <div className="select-none font-bold mb-1 shadow-lg text-nowrap mt-10 text-xs">
            {deviceName}
          </div>
        </Html>
      </Fragment>

      <PointActionMap />
    </Canvas>
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
