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
import { Canvas } from '@react-three/fiber'
import { Html, OrbitControls } from '@react-three/drei'
import { Fragment } from 'react'
import * as THREE from 'three'
import { Vector3 } from 'three'

const RebotDogMap: FC<unknown> = memo(() => {
  const activeMapUrl = useRebotDogControlRoomStore((s) => s.activeMapUrl)

  const [text, setText] = useState('哈哈哈哈')
  useInterval(() => {
    setText((text) => (text === '哈哈哈哈' ? '发发地方' : '哈哈哈哈'))
  }, 1000)

  const device = {
    x: 0,
    y: 0,
    z: 0,
    deviceName: '123',
  }

  return (
    <Canvas>
      <PointCloudLayer
        url={activeMapUrl || '/pcd_data/test-2.pcd'}
        onClick={() => {}}
      />
      <Fragment>
        <sprite scale={0.05} position={new Vector3(device.x, device.y, device.z)}>
          <spriteMaterial
            sizeAttenuation={false}
            map={new THREE.TextureLoader().load(
              '/images/airline/inverted-triangle-blue.svg',
            )}
            depthTest={false}
          ></spriteMaterial>
        </sprite>
        <Html position={new Vector3(device.x, device.y, device.z)} center>
          <div className="select-none font-bold mb-1 text-sm shadow-lg">
            {device.deviceName}
          </div>
        </Html>
      </Fragment>
    </Canvas>
  )
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
