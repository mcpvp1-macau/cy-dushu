import AppCollapse from '@/components/AppCollapse'
import { lazy } from 'react'
import { useDeviceDetailStore } from '../../hooks/useDeviceDetail.store'
import useDeviceChildrenList from '@/hooks/device/useDeviceChildrenList'
import AppViewSuspense from '@/components/AppViewSuspense'
import AppSpin from '@/components/AppSpin'
import IconButton from '@/components/ui/button/IconButton'
import IconRefresh from '@/assets/icons/jsx/IconRefresh'
import { GetProps } from 'antd'
import { twMerge } from 'tailwind-merge'

const DeviceDetailMediaDataPicture = lazy(
  () => import('../MediaData/MediaPicture'),
)
const DeviceDetailMediaHistoryVideo = lazy(() => import('../HistoryVideo'))

type PropsType = GetProps<typeof AppCollapse>

/** 数据折叠 */
const DataCollapse: FC<PropsType> = memo(({ ...props }) => {
  const { t } = useTranslation()

  const deviceDetail = useDeviceDetailStore((s) => s.deviceDetail)
  const deviceList = useDeviceChildrenList(deviceDetail)

  const queryClient = useQueryClient()

  if (!deviceDetail) {
    return <AppSpin />
  }

  return (
    <>
      <AppCollapse
        {...props}
        className={twMerge('border-x-0 border-b-0', props.className)}
        defaultActiveKey={[0, 1].concat(
          (props.defaultActiveKey ?? []) as number[],
        )}
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
        ].concat(props.items ?? ([] as any[]))}
      />
    </>
  )
})

DataCollapse.displayName = 'UavDetailData'

export default DataCollapse
