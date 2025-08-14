import usePointCloud3DWaylineStore from '@/store/wayline/point-cloud-3d-wayline/usePointCloud3D.store'
import { handleStorageURL } from '@/pages/events/components/EventDetail'
import DrawPointListener from './DrawPointListener'
import { Fragment } from 'react/jsx-runtime'
import { Canvas } from '@react-three/fiber'
import { Html, TrackballControls } from '@react-three/drei'
import { Vector3 } from 'three'
import * as THREE from 'three'
import { PointCloudLayer } from '@/components/PointCloudMap'

type PropsType = unknown

const PointCloud3DWaylineMap: FC<PropsType> = memo(() => {
  const spaceMapUrl = usePointCloud3DWaylineStore((s) => s.spaceMapUrl)
  const isDrawPoint = usePointCloud3DWaylineStore((s) => s.isDrawPoint)
  const waypoints = usePointCloud3DWaylineStore((s) => s.waypointsConfig)

  console.log('waypoints', waypoints)

  return (
    <Canvas>
      <TrackballControls />
      {spaceMapUrl && (
        <PointCloudLayer
          url={handleStorageURL(spaceMapUrl)}
          onClick={(position) => {
            if (!isDrawPoint) {
              return
            }
            console.log('position', position)
            const sto = usePointCloud3DWaylineStore.getState()

            sto.addWaypoint({
              x: position.x,
              y: position.y,
              z: 0,
              q_x: 0,
              q_y: 0,
              q_z: 0,
              q_w: 1,
            })
          }}
        />
      )}
      <DrawPointListener />
      {waypoints.map((e) => (
        <Fragment key={e.xid}>
          <sprite scale={0.05} position={new Vector3(e.x, e.y, e.z)}>
            <spriteMaterial
              sizeAttenuation={false}
              map={new THREE.TextureLoader().load(
                '/images/airline/inverted-triangle-blue.svg',
              )}
              depthTest={false}
            ></spriteMaterial>
          </sprite>
          <Html position={new Vector3(e.x, e.y, e.z)} center>
            <div className="select-none font-bold mb-1 text-sm shadow-lg">
              {e.positionIndex}
            </div>
          </Html>
        </Fragment>
      ))}
    </Canvas>
  )
})

PointCloud3DWaylineMap.displayName = 'PointCloud3DWaylineMap'

export default PointCloud3DWaylineMap
