import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import { useDebounceEffect, useMemoizedFn } from 'ahooks'
import useAirlineConfigStore from '@/store/wayline/uav-airline/useAirlineConfig.store'

type PropsType = unknown

/** 测距 */
const DistanceMeasure: FC<PropsType> = memo(() => {
  const { viewer } = useCesium()
  const [distance, setDistance] = useState<number | null>(null)
  const uav = useAirlineConfigStore((s) => s.uav)

  const calcDistance = useMemoizedFn(() => {
    if (!viewer) {
      return
    }
    setDistance(null)
    const ray = viewer.camera.getPickRay(
      new Cesium.Cartesian2(
        viewer.canvas.clientWidth / 2,
        viewer.canvas.clientHeight / 2,
      ),
    )
    if (!ray) {
      return
    }
    const position = viewer.scene.globe.pick(ray, viewer.scene)
    if (!position) {
      return
    }

    const cameraPosition = viewer.camera.positionWC
    const distance = Cesium.Cartesian3.distance(cameraPosition, position)
    setDistance(distance)
  })

  useDebounceEffect(
    () => {
      calcDistance()
    },
    [uav],
    {
      wait: 300,
    },
  )

  return (
    <div
      className="absolute left-1/2 top-1/2 opacity-65 pointer-events-none"
      style={{ transform: 'translate(-50%, -50%)' }}
    >
      <svg width={24} height={24} viewBox="0 0 100 100" stroke="white">
        {Array.from({ length: 4 }).map((_, i) => (
          <g key={i} transform={`rotate(${45 + 90 * i}, 50, 50)`}>
            <line x1="50" y1="0" x2="50" y2="38" strokeWidth="8" />
          </g>
        ))}
      </svg>
      {distance && (
        <div
          className="absolute left-0 top-1/2 text-white text-xs p-1 pointer-events-none"
          style={{
            transform: 'translate(-100%, -50%)',
            textShadow: '1px 1px 1px #0009',
          }}
        >
          {distance.toFixed(1)}m
        </div>
      )}
    </div>
  )
})

DistanceMeasure.displayName = 'DistanceMeasure'

export default DistanceMeasure
