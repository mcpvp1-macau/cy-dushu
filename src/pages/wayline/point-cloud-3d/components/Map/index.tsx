import { PointCloudLayer } from '@/components/PointCloudMap'
import usePointCloud3DWaylineStore from '@/store/wayline/point-cloud-3d-wayline/usePointCloud3D.store'
import { handleStorageURL } from '@/pages/events/components/EventDetail'
import DrawPointListener from './DrawPointListener'
import { Canvas } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import { Vector3 } from 'three'
import Waypoint from './Wayponit'

type PropsType = unknown

const PointCloud3DWaylineMap: FC<PropsType> = memo(() => {
  const spaceMapUrl = usePointCloud3DWaylineStore((s) => s.spaceMapUrl)
  const isDrawPoint = usePointCloud3DWaylineStore((s) => s.isDrawPoint)
  const waypoints = usePointCloud3DWaylineStore((s) => s.waypointsConfig)

  const handleLeave = () => {
    const sto = usePointCloud3DWaylineStore.getState()
    if (sto.isMovePoint) {
      sto.updateIsMovePoint(false)
    }
  }

  return (
    <Canvas onPointerUp={handleLeave} onPointerLeave={handleLeave}>
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
        <Waypoint key={e.positionIndex} data={e} />
      ))}
      {waypoints.length >= 2 && (
        <Line
          points={waypoints.map((e) => new Vector3(e.x, e.y, e.z))}
          color="#4e85e1"
          lineWidth={3} // 折线宽度
        />
      )}
    </Canvas>
  )
})

PointCloud3DWaylineMap.displayName = 'PointCloud3DWaylineMap'

export default PointCloud3DWaylineMap
