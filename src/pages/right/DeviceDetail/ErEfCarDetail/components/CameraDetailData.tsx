import AppCollapse from '@/components/AppCollapse'
import DeviceDetailMediaData, { MediaType } from '../../components/MediaData'
import LinkSwitch from '@/components/LinkSwitch'
import AiData from '@/components/AiData'
import { FC, memo } from 'react'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { useRef } from 'react'

type PropsType = {
  deviceId: string
  deviceType: string
}

const CameraDetailData: FC<PropsType> = memo(({ deviceId, deviceType }) => {
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

  const { t } = useTranslation()

  return (
    <AppCollapse
      defaultActiveKey={['AI_DATA']}
      // bordered={false}
      className='border-x-0 border-b-0'
      items={[
        // {
        //   label: (
        //     <LinkSwitch
        //       value={mediaType}
        //       items={items}
        //       onChange={(e: string) => setMediaType(e as MediaType)}
        //     />
        //   ),
        //   children: <DeviceDetailMediaData type={mediaType} />,
        // },
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
