import AppCollapse from '@/components/AppCollapse'
import { memo, type FC } from 'react'
import DeviceDetailMediaData, { MediaType } from '../../components/MediaData'
import LinkSwitch from '@/components/LinkSwitch'

type PropsType = unknown

const WangLouDetailData: FC<PropsType> = memo(() => {
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
      ]}
    ></AppCollapse>
  )
})

WangLouDetailData.displayName = 'WangLouDetailData'

export default WangLouDetailData
