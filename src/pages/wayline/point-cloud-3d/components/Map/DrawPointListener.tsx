import { useThree } from '@/components/PointCloudMap/hooks/useThree'
import usePointCloud3DWaylineStore from '@/store/wayline/point-cloud-3d-wayline/usePointCloud3D.store'
import { memo, type FC } from 'react'

type PropsType = unknown

const DrawPointListener: FC<PropsType> = memo(() => {
  const renderer = useThree((s) => s.renderer)
  const isDrawPoint = usePointCloud3DWaylineStore((s) => s.isDrawPoint)

  useEffect(() => {
    if (!renderer?.domElement || !isDrawPoint) {
      return
    }
    renderer.domElement.style.cursor = 'crosshair'
    return () => {
      renderer.domElement.style.cursor = 'default'
    }
  }, [isDrawPoint, renderer])

  return null
})

DrawPointListener.displayName = 'DrawPointListener'

export default DrawPointListener
