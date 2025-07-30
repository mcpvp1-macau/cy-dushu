import { Button, Flex } from 'antd'
import Icon from '@/components/Icon'
import { usePostDeviceService } from '@/hooks/device/usePostDeviceService'
import React from 'react'
import SliderValue from '@/pages/control-room/others/components/ControlPanl/ZoomControl/SliderValue'

interface Props {
  item: API_DEVICE.domain.Device
}

const ZoomControl: React.FC<Props> = ({ item }) => {
  const disabled = false // useWangLouControlRoomStore((s) => !s.hasControlPower)
  const { t } = useTranslation()
  const post = usePostDeviceService(
    item.deviceModel?.productKey || '',
    item.deviceId || '',
  )

  const onChangeCompleteZoom = (value: number | null) => {
    value && post('liveZoomChange', {
      //   direction: value,
      controlTag: '',
      //   enable: value ? 'true' : 'false',
      zoomFactor: value,
      videoId: item.properties.videoList?.[0]?.videoId,
    })
  }
  const onChangeCompleteFocal = (value: number | null) => {
    value && post('focalLengthChange', {
      //   direction: value,
      controlTag: '',
      //   enable: value ? 'true' : 'false',
      focus: value,
      videoId: item.properties.videoList?.[0]?.videoId,
    })
  }
  return (
    <Flex gap={12} vertical className={'p-[10px] text-[12px]'}>
      <SliderValue
        disabled={disabled}
        // disabled={false}
        onChange={onChangeCompleteZoom}
        title={t('common.zoom.title')}
      />
      {/* <SliderValue
        disabled={disabled}
        // disabled={false}
        onChange={onChangeCompleteFocal}
        title={t('common.zoom.focal')}
      /> */}
    </Flex>
  )
}

export default React.memo(ZoomControl)
