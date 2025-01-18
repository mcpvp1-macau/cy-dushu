import DrawBox from '@/components/DrawBox'
import usePostDeviceService from '../../../hooks/usePostDeviceService'
import { GetProps } from 'antd'

type PropsType = unknown

/** 智能追踪 */
const AITrackBoxSelect: FC<PropsType> = memo(() => {
  const postService = usePostDeviceService()

  const handleEnd: GetProps<typeof DrawBox>['onDrawEnd'] = (rect) => {
    postService('smartTrack', {
      enable: true,
      x1: rect[0],
      y1: rect[1],
      x2: rect[2],
      y2: rect[3],
    })
  }

  return <DrawBox onDrawEnd={handleEnd} />
})

AITrackBoxSelect.displayName = 'AITrackBoxSelect'

export default AITrackBoxSelect
