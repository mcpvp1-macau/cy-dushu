import DrawBox from '@/components/DrawBox'
import usePostDeviceService from '@/pages/right/DeviceDetail/hooks/usePostDeviceService'

type PropsType = unknown

const BoxSelectV1: FC<PropsType> = memo(() => {
  const postService = usePostDeviceService()

  const handleDrawEnd = ([x1, y1, x2, y2]: [
    number,
    number,
    number,
    number,
  ]) => {
    // 框选变焦
    postService('gimbalToPoint', { x1, y1, x2, y2 })
  }

  return <DrawBox onDrawEnd={handleDrawEnd} />
})

BoxSelectV1.displayName = 'BoxSelectV1'

export default BoxSelectV1
