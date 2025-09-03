import { LiveVideoParams, WindowType } from '@/store/useFixedWindows.store'
import BaseWindow from './BaseWindow'
import { getDeviceDetail } from '@/service/modules/device'
import { LoadingOutlined } from '@ant-design/icons'
import { lazy, Suspense } from 'react'
import AppSpin from '@/components/AppSpin'

type PropsType = {
  data: WindowType & { params: LiveVideoParams }
}

const DeviceLiveVideo = lazy(
  () => import('@/components/VideoS/DeviceLiveVideo'),
)

/** 窗口 - 实况视频 */
const FixedWindowLiveVideo: FC<PropsType> = memo(({ data }) => {
  const queryClient = useQueryClient()
  const { data: detail, isLoading } = useQuery(
    {
      queryKey: ['deviceDetail', data.params.deviceId],
      queryFn: () => getDeviceDetail(data.params.deviceId),
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
      <Suspense fallback={<AppSpin className="abs-center" />}>
        <DeviceLiveVideo
          useDing={false}
          productKey={data.params.productKey}
          deviceId={data.params.deviceId}
          videoId={data.params.videoId}
        />
      </Suspense>
    </BaseWindow>
  )
})

FixedWindowLiveVideo.displayName = 'FixedWindowLiveVideo'

export default FixedWindowLiveVideo
