import AppCollapse from '@/components/AppCollapse'
import DeviceDetailMediaData, { MediaType } from '../../components/MediaData'
import LinkSwitch from '@/components/LinkSwitch'
import AiData from '@/components/AiData'

type PropsType = {
  deviceId: string
  deviceType: string
}

const CameraDetailData: FC<PropsType> = memo(({ deviceId, deviceType }) => {
  const { t } = useTranslation()
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
      defaultActiveKey={['PICTURE', 'AI_DATA']}
      // bordered={false}
      className='border-x-0 border-b-0'
      items={[
        {
          key: 'PICTURE',
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
          key: 'AI_DATA',
          label: t('common.aiData'),
          children: <AiData deviceId={deviceId} deviceType={deviceType} />,
        },
      ]}
    ></AppCollapse>
  )
})

CameraDetailData.displayName = 'CameraDetailData'

export default CameraDetailData
