import XModal from '@/components/XModal'
import { getDeviceDetail } from '@/service/modules/device'
import { Tabs } from 'antd'
import { lazy, memo, type FC } from 'react'
import AppSpin from '@/components/AppSpin'
import AppViewSuspense from '@/components/AppViewSuspense'
import useDeviceChildrenList from '@/hooks/device/useDeviceChildrenList'

const PictureData = lazy(() => import('./PictureData'))
const VideoData = lazy(() => import('./VideoData'))
const HistoryTrack = lazy(() => import('./HistoryTrack'))

type PropsType = {
  deviceId: string
  open: boolean
  onClose?: () => void
}

const DataModal: FC<PropsType> = memo(({ deviceId, open, onClose }) => {
  const queryClient = useQueryClient()

  // 获取设备详情
  const { data, isLoading } = useQuery(
    {
      queryKey: ['deviceDetail', deviceId],
      queryFn: () => getDeviceDetail(deviceId),
      enabled: open && !!deviceId,
      select: (d) => d.data,
    },
    queryClient,
  )

  const deviceList = useDeviceChildrenList(data)

  return (
    <XModal
      width={830}
      title="数据"
      open={open}
      footer={false}
      onClose={onClose}
    >
      {isLoading || !data ? (
        <AppSpin />
      ) : (
        <div>
          <Tabs
            items={[
              {
                label: '图片',
                key: 'PICTURE',
                children: (
                  <div className="min-h-[138px]">
                    <AppViewSuspense>
                      <PictureData deviceList={deviceList} />
                    </AppViewSuspense>
                  </div>
                ),
              },
              {
                label: '视频',
                key: 'VIDEO',
                children: (
                  <div className="min-h-[138px]">
                    <AppViewSuspense>
                      <VideoData deviceList={deviceList} />
                    </AppViewSuspense>
                  </div>
                ),
              },
              {
                label: '轨迹',
                key: 'TRACK',
                children: (
                  <div className="min-h-[138px]">
                    <AppViewSuspense>
                      <HistoryTrack />
                    </AppViewSuspense>
                  </div>
                ),
              },
            ]}
          />
        </div>
      )}
    </XModal>
  )
})

DataModal.displayName = 'DataModal'

export default DataModal
