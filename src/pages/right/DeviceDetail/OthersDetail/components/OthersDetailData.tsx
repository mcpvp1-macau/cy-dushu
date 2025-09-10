import AppCollapse from '@/components/AppCollapse'
import { memo, type FC } from 'react'
import DeviceDetailMediaData, { MediaType } from '../../components/MediaData'
import LinkSwitch from '@/components/LinkSwitch'
import AiData from '@/components/AiData'
import useHaveVIdeo from '../hooks/useHaveVIdeo'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'

type PropsType = {
  deviceId: string
  deviceType: string
}

const OthersDetailData: FC<PropsType> = memo(({ deviceId, deviceType }) => {
  const [mediaType, setMediaType] = useState<MediaType>('PICTURE')
  const { t } = useTranslation()

  const deviceDetail = useDeviceDetailStore((s) => s.deviceDetail)
  const isHaveVideo = useHaveVIdeo(deviceDetail)

  return (
    <AppCollapse
      defaultActiveKey={['PICTURE']}
      items={[
        ...(isHaveVideo
          ? [
              {
                label: (
                  <LinkSwitch
                    value={mediaType}
                    items={[
                      {
                        label: t('common.picture'),
                        value: 'PICTURE',
                      },
                      {
                        label: t('common.video'),
                        value: 'HISTORY_VIDEO',
                      },
                    ]}
                    onChange={(e: string) => setMediaType(e as MediaType)}
                  />
                ),
                children: <DeviceDetailMediaData type={mediaType} />,
              },
            ]
          : []),
        {
          label: t('common.aiData'),
          children: <AiData deviceId={deviceId} deviceType={deviceType} />,
        },
      ]}
    ></AppCollapse>
  )
})

OthersDetailData.displayName = 'OthersDetailData'

export default OthersDetailData
