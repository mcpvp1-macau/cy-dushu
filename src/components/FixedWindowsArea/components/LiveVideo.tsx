import DeviceLiveVideo from '@/components/VideoS/DeviceLiveVideo'
import { WindowType } from '@/store/useFixedWindows.store'
import BaseWindow from './BaseWindow'
import { getDeviceDetail } from '@/service/modules/device'
import { LoadingOutlined } from '@ant-design/icons'

type PropsType = {
  data: WindowType['type'] extends 'live-video' ? WindowType : never
}

/** 窗口 - 实况视频 */
const FixedWindowLiveVideo: FC<PropsType> = memo(({ data }) => {
  const queryClient = useQueryClient()
  const { data: detail, isLoading } = useQuery(
    {
      queryKey: ['deviceDetail', data.deviceId],
      queryFn: () => getDeviceDetail(data.deviceId),
    },
    queryClient,
  )

  return (
    <BaseWindow
      id={data.id}
      {...data.layout}
      title={
        isLoading || !detail ? <LoadingOutlined /> : `${detail.data.deviceName}`
      }
    >
      <DeviceLiveVideo
        useDing={false}
        productKey={data.productKey}
        deviceId={data.deviceId}
        videoId={data.videoId}
      />
    </BaseWindow>
  )
})

FixedWindowLiveVideo.displayName = 'FixedWindowLiveVideo'

export default FixedWindowLiveVideo
