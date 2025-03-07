import AppCollapse from '@/components/AppCollapse'
import { lazy } from 'react'
import { useDeviceDetailStore } from '../../hooks/useDeviceDetail.store'
import useDeviceChildrenList from '@/hooks/device/useDeviceChildrenList'
import AppViewSuspense from '@/components/AppViewSuspense'
import AppSpin from '@/components/AppSpin'
import UsePrevDayHisTrack from './PrevDayHisTrack'
import useIsRightDetail from '../../hooks/useIsRightDetail'
import IconButton from '@/components/ui/button/IconButton'
import IconRefresh from '@/assets/icons/jsx/IconRefresh'

const DeviceDetailMediaDataPicture = lazy(
  () => import('../../components/MediaData/MediaPicture'),
)
const DeviceDetailMediaHistoryVideo = lazy(
  () => import('../../components/HistoryVideo'),
)

type PropsType = {}

const UavDetailData: FC<PropsType> = memo(() => {
  const { t } = useTranslation()

  const deviceDetail = useDeviceDetailStore((s) => s.deviceDetail)
  const deviceList = useDeviceChildrenList(deviceDetail)

  const isRightDetail = useIsRightDetail()

  const queryClient = useQueryClient()

  if (!deviceDetail) {
    return <AppSpin />
  }

  return (
    <>
      <AppCollapse
        className="border-x-0 border-b-0"
        defaultActiveKey={[0, 1]}
        items={[
          {
            label: (
              <div className="flex gap-2">
                {t('common.picture')}
                <IconButton
                  className="text-xs"
                  onClick={(e) => {
                    e.stopPropagation()
                    queryClient.invalidateQueries({
                      queryKey: [
                        'getPlatformCapture',
                        'PICTURE',
                        deviceDetail.deviceId,
                      ],
                      exact: false,
                    })
                  }}
                >
                  <IconRefresh />
                </IconButton>
              </div>
            ),
            key: 0,
            children: (
              <AppViewSuspense>
                <DeviceDetailMediaDataPicture deviceList={deviceList} />
              </AppViewSuspense>
            ),
          },
          {
            label: (
              <div className="flex gap-2">
                {t('common.video')}
                <IconButton
                  className="text-xs"
                  onClick={(e) => {
                    e.stopPropagation()
                    queryClient.invalidateQueries({
                      queryKey: ['getHistoryVideo', deviceDetail.deviceId],
                      exact: false,
                    })
                  }}
                >
                  <IconRefresh />
                </IconButton>
              </div>
            ),
            key: 1,
            children: (
              <AppViewSuspense>
                <DeviceDetailMediaHistoryVideo
                  deviceList={deviceList}
                  deviceType={deviceDetail?.deviceType}
                />
              </AppViewSuspense>
            ),
          },
        ]}
      />
      {isRightDetail && <UsePrevDayHisTrack />}
    </>
  )
})

UavDetailData.displayName = 'UavDetailData'

export default UavDetailData
