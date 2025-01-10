import AppCollapse from '@/components/AppCollapse'
import { memo, type FC } from 'react'
import DeviceDetailMediaData, { MediaType } from '../../components/MediaData'
import LinkSwitch from '@/components/LinkSwitch'
import AiData from '@/components/AiData'

type PropsType = {
  deviceId: string
}

const WangLouDetailData: FC<PropsType> = memo(({ deviceId }) => {
  const [mediaType, setMediaType] = useState<MediaType>('PICTURE')

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
          children: <DeviceDetailMediaData type={mediaType} />,
        },
        {
          label: '检测数据',
          children: <AiData deviceId={deviceId} deviceType="WANGLOU" />,
        },
      ]}
    ></AppCollapse>
  )
})

WangLouDetailData.displayName = 'WangLouDetailData'

export default WangLouDetailData
