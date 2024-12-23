import AppCollapse from '@/components/AppCollapse'
import { memo, type FC } from 'react'

import LinkSwitch from '@/components/LinkSwitch'
import DeviceDetailMediaData, { MediaType } from '../../components/MediaData'
import usePrevDayHisTrack from '../hooks/usePrevDayHisTrack'
import AppEmpty from '@/components/AppEmpty'

type PropsType = {}

const UavDetailData: FC<PropsType> = memo(() => {
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

  usePrevDayHisTrack()

  return (
    <AppCollapse
      className="border-x-0 border-b-0"
      items={[
        {
          label: (
            <LinkSwitch
              value={mediaType}
              items={items}
              onChange={(e) => setMediaType(e as MediaType)}
            />
          ),
          children: <DeviceDetailMediaData type={mediaType} />,
        },
        {
          label: '检测数据',
          children: <AppEmpty />,
        },
      ]}
    />
  )
})

UavDetailData.displayName = 'UavDetailData'

export default UavDetailData
