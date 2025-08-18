import usePointCloud3DWaylineStore from '@/store/wayline/point-cloud-3d-wayline/usePointCloud3D.store'
import { useThree } from '@react-three/fiber'

type PropsType = unknown

const DrawPointListener: FC<PropsType> = memo(() => {
  const renderer = useThree((s) => s.gl)
  const isDrawPoint = usePointCloud3DWaylineStore((s) => s.isDrawPoint)
  const isMovePoint = usePointCloud3DWaylineStore((s) => s.isMovePoint)

  const defaultMouseStyle = useRef('default')

  useEffect(() => {
    if (!renderer?.domElement) {
      return
    }
    if (!isDrawPoint && !isMovePoint) {
      return
    }

    // 如果正在拖拽点位
    if (isMovePoint) {
      renderer.domElement.style.cursor = 'move' // Change to a move cursor when moving points

      return () => {
        renderer.domElement.style.cursor = defaultMouseStyle.current
      }
    }

    renderer.domElement.style.cursor = 'crosshair' // Change to a crosshair cursor when drawing points
    defaultMouseStyle.current = 'crosshair' // Store the default cursor style

    return () => {
      renderer.domElement.style.cursor = 'default'
      defaultMouseStyle.current = 'default'
    }
  }, [isDrawPoint, isMovePoint, renderer])

  return (
    <>
      {/* <CameraControls
        enabled={!isMovePoint}
        // verticalDragToForward={false}
        // dollyToCursor={false}
        // infinityDolly={false}
      /> */}
    </>
  )
})

DrawPointListener.displayName = 'DrawPointListener'

export default DrawPointListener
