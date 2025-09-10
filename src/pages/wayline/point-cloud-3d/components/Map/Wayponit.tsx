import { PointCloud3DWaypointConfigType } from '@/store/wayline/point-cloud-3d-wayline/types'
import { Html } from '@react-three/drei'
import { TextureLoader, Vector3 } from 'three'
import usePointCloud3DWaylineStore from '@/store/wayline/point-cloud-3d-wayline/usePointCloud3D.store'

type PropsType = {
  data: PointCloud3DWaypointConfigType
}

const Waypoint: FC<PropsType> = memo(({ data }) => {
  const handlePointDown = () => {
    const sto = usePointCloud3DWaylineStore.getState()
    sto.updateIsMovePoint(true)
    sto.updateCurrentIndex(data.positionIndex)
  }

  return (
    <>
      <sprite scale={0.05} position={new Vector3(data.x, data.y, data.z)}>
        <spriteMaterial
          sizeAttenuation={false}
          map={new TextureLoader().load(
            '/images/airline/inverted-triangle-blue.svg',
          )}
          depthTest={false}
        ></spriteMaterial>
      </sprite>
      <Html position={new Vector3(data.x, data.y, data.z)} center>
        <div
          className="font-bold mb-1 text-sm text-shadow-sm text-white cursor-move px-1 leading-4 select-none"
          onPointerDown={handlePointDown}
        >
          {data.positionIndex}
        </div>
      </Html>
    </>
  )
})

Waypoint.displayName = 'Waypoint'

export default Waypoint
