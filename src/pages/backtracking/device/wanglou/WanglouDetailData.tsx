import AppCollapse from '@/components/AppCollapse'
import { memo, type FC } from 'react'
import LinkSwitch from '@/components/LinkSwitch'
import AiData from '@/components/AiData'
import DeviceDetailMediaData, {
  MediaType,
} from '@/pages/right/DeviceDetail/components/MediaDataBackTracking'
import { useBackTrackingStore } from '@/store/context-store/useBackTracking.store'

type PropsType = {
  deviceId: string
  deviceDetail: API_DEVICE.domain.Device
}

const WangLouDetailData: FC<PropsType> = memo(({ deviceId, deviceDetail }) => {
  const [mediaType, setMediaType] = useState<MediaType>('PICTURE')

  const timeRange = useBackTrackingStore((s) => s.timeRange)

  const items = useRef([
    {
      label: '图片',
      value: 'PICTURE',
    },
    {
      label: '视频',
      value: 'HISTORY_VIDEO',
    },
  ]).current

  return (
    <AppCollapse
      defaultActiveKey={['PICTURE']}
      items={[
        {
          label: (
            <LinkSwitch
              value={mediaType}
              items={items}
              onChange={(e: string) => setMediaType(e as MediaType)}
            />
          ),
          children: (
            <DeviceDetailMediaData
              type={mediaType}
              deviceDetail={deviceDetail}
            />
          ),
        },
        {
          label: '检测数据',
          children: <AiData deviceId={deviceId} deviceType="WANGLOU" timeRange={timeRange}/>,
        },
      ]}
    ></AppCollapse>
  )
})

WangLouDetailData.displayName = 'WangLouDetailData'

export default WangLouDetailData
