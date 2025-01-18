import AppCollapse from '@/components/AppCollapse'
import { memo, type FC } from 'react'
import DeviceDetailMediaData, { MediaType } from '../../components/MediaData'
import LinkSwitch from '@/components/LinkSwitch'
import AiData from '@/components/AiData'

type PropsType = {
  deviceId: string
  deviceType: string
}

const OthersDetailData: FC<PropsType> = memo(({ deviceId, deviceType }) => {
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
          //   children: <>123</>,
          children: <DeviceDetailMediaData type={mediaType} />,
        },
        {
          label: '检测数据',
          //   children: <>123</>,
          children: <AiData deviceId={deviceId} deviceType={deviceType} />,
        },
      ]}
    ></AppCollapse>
  )
})

OthersDetailData.displayName = 'OthersDetailData'

export default OthersDetailData
