import AppCollapse from '@/components/AppCollapse'
import { lazy } from 'react'
import usePrevDayHisTrack from '../hooks/usePrevDayHisTrack'
import { useDeviceDetailStore } from '../../hooks/useDeviceDetail.store'
import useDeviceChildrenList from '@/hooks/device/useDeviceChildrenList'
import AppViewSuspense from '@/components/AppViewSuspense'
import AppSpin from '@/components/AppSpin'

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

  usePrevDayHisTrack()

  if (!deviceDetail) {
    return <AppSpin />
  }

  return (
    <AppCollapse
      className="border-x-0 border-b-0"
      defaultActiveKey={[0, 1]}
      items={[
        {
          label: t('common.picture'),
          key: 0,
          children: (
            <AppViewSuspense>
              <DeviceDetailMediaDataPicture deviceList={deviceList} />
            </AppViewSuspense>
          ),
        },
        {
          label: t('common.video'),
          key: 1,
          children: (
            <AppViewSuspense>
              <DeviceDetailMediaHistoryVideo deviceList={deviceList} deviceType={deviceDetail?.deviceType}/>
            </AppViewSuspense>
          ),
        },
        // {
        //   label: '检测数据',
        //   children: <AppEmpty />,
        // },
      ]}
    />
  )
})

UavDetailData.displayName = 'UavDetailData'

export default UavDetailData
