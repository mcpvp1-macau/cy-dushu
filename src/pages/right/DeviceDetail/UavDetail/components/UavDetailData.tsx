import AppCollapse from '@/components/AppCollapse'
import { lazy } from 'react'
import usePrevDayHisTrack from '../hooks/usePrevDayHisTrack'
import { useDeviceDetailStore } from '../../hooks/useDeviceDetail.store'
import useDeviceChildrenList from '@/hooks/device/useDeviceChildrenList'
import AppViewSuspense from '@/components/AppViewSuspense'

const DeviceDetailMediaDataPicture = lazy(
  () => import('../../components/MediaData/MediaPicture'),
)
const DeviceDetailMediaHistoryVideo = lazy(
  () => import('../../components/HistoryVideo'),
)

type PropsType = {}

const UavDetailData: FC<PropsType> = memo(() => {
  const { t } = useTranslation()

  const deviceDetail = useDeviceDetailStore((s) => s.deviceDetail)!
  const deviceList = useDeviceChildrenList(deviceDetail)

  usePrevDayHisTrack()

  return (
    <AppCollapse
      className="border-x-0 border-b-0"
      items={[
        {
          label: t('common.picture'),
          children: (
            <AppViewSuspense>
              <DeviceDetailMediaDataPicture deviceList={deviceList} />
            </AppViewSuspense>
          ),
        },
        {
          label: t('common.video'),
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
