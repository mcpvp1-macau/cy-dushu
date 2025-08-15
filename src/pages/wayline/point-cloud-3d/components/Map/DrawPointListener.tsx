import usePointCloud3DWaylineStore from '@/store/wayline/point-cloud-3d-wayline/usePointCloud3D.store'
import { CameraControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import mitt from 'mitt'

type PropsType = unknown

export const mouseEnterEmitter = mitt<{
  'enter-waypoint': void
  'leave-waypoint': void
}>()

const DrawPointListener: FC<PropsType> = memo(() => {
  const renderer = useThree((s) => s.gl)
  const isDrawPoint = usePointCloud3DWaylineStore((s) => s.isDrawPoint)
  const isMovePoint = usePointCloud3DWaylineStore((s) => s.isMovePoint)

  const defaultMouseStyle = useRef('default')

  useEffect(() => {
    if (!renderer?.domElement || !isDrawPoint || !isMovePoint) {
      return
    }
    // 如果正在拖拽点位
    if (isMovePoint) {
      renderer.domElement.style.cursor = 'move' // Change to a move cursor when moving points
      defaultMouseStyle.current = 'move' // Store the default cursor style

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

  // 监听鼠标是否到达 waypoint
  useEffect(() => {
    if (!renderer?.domElement) {
      return
    }
    const handleMouseEnter = () => {
      renderer.domElement.style.cursor = 'move' // Change to a crosshair cursor when hovering
    }
    const handleMouseLeave = () => {
      renderer.domElement.style.cursor = defaultMouseStyle.current
    }
    mouseEnterEmitter.on('enter-waypoint', handleMouseEnter)
    mouseEnterEmitter.on('leave-waypoint', handleMouseLeave)

    return () => {
      mouseEnterEmitter.off('enter-waypoint', handleMouseEnter)
      mouseEnterEmitter.off('leave-waypoint', handleMouseLeave)
    }
  }, [renderer])

  return (
    <>
      <CameraControls
        enabled={!isMovePoint}
        verticalDragToForward={false}
        dollyToCursor={false}
        infinityDolly={false}
      />
    </>
  )
})

DrawPointListener.displayName = 'DrawPointListener'

export default DrawPointListener
