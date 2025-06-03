import DrawBox from '@/components/DrawBox'
import usePostDeviceService from '@/pages/right/DeviceDetail/hooks/usePostDeviceService'

type PropsType = unknown

/** 指点定位 */
const PointZoom: FC<PropsType> = memo(() => {
  const postService = usePostDeviceService()

  const handleDrawEnd = ([x1, y1, x2, y2]: [
    number,
    number,
    number,
    number,
  ]) => {
    postService('tapZoomAtTarget', { x1, y1, x2, y2 })
  }

  return <DrawBox onDrawEnd={handleDrawEnd} />
})

PointZoom.displayName = 'PointZoom'

export default PointZoom
