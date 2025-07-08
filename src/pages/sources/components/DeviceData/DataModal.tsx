import XModal from '@/components/XModal'
import { getDeviceDetail } from '@/service/modules/device'
import { Tabs } from 'antd'
import { lazy } from 'react'
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
  const { t } = useTranslation()

  return (
    <XModal
      title={t('common.data')}
      open={open}
      footer={false}
      onClose={onClose}
      centered
      width={{
        xs: '100%',
        sm: '100%',
        md: '80%',
        lg: '70%',
        xl: '65%',
        xxl: '65%',
      }}
    >
      {isLoading || !data ? (
        <AppSpin />
      ) : (
        <div>
          <Tabs
            items={[
              {
                label: t('common.picture'),
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
                label: t('common.video'),
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
                label: t('common.track'),
                key: 'TRACK',
                children: (
                  <div className="min-h-[138px]">
                    <AppViewSuspense>
                      <HistoryTrack deviceList={deviceList} />
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
