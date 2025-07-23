import DrawBox from '@/components/DrawBox'
import usePostDeviceService from '@/pages/right/DeviceDetail/hooks/usePostDeviceService'
import { useUavControlRoomStoreInstance } from '@/store/context-store/useUavControlRoom.store'
import { GetProps } from 'antd'

type PropsType = unknown

const TapToFlyOnVideo: FC<PropsType> = memo(() => {
  const postService = usePostDeviceService()
  const uavStore = useUavControlRoomStoreInstance()

  const handleEnd: GetProps<typeof DrawBox>['onDrawEnd'] = (rect) => {
    postService('gotoPosAtTarget', {
      x1: rect[0],
      y1: rect[1],
      x2: rect[2],
      y2: rect[3],
    })
    uavStore.setState({
      openTapToFlyOnVideo: false,
    })
  }

  return <DrawBox onDrawEnd={handleEnd} />
})

TapToFlyOnVideo.displayName = 'TapToFlyOnVideo'

export default TapToFlyOnVideo
