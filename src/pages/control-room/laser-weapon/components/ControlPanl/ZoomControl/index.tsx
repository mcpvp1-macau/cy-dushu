import { Button, Flex } from 'antd'
import SliderValue from './SliderValue'
import Icon from '@/components/Icon'
import { usePostDeviceService } from '@/hooks/device/usePostDeviceService'
import React from 'react'

interface Props {
  item: API_DEVICE.domain.Device
}

const ZoomControl: React.FC<Props> = ({ item }) => {
  const childData = item
  const disabled = false // useWangLouControlRoomStore((s) => !s.hasControlPower)
  const { t } = useTranslation()
  // const uuid = useWangLouControlRoomStore((s) => s.uuid)
  const post = usePostDeviceService(
    childData?.deviceModel?.productKey || '',
    childData?.deviceId || '',
  )
  const run = () => {
    post('autoFocus', {
      controlTag: '',
    })
  }

  const onChangeCompleteZoom = (value: number | null) => {
    post('zoomByStep', {
      direction: value,
      controlTag: '',
      enable: value ? 'true' : 'false',
    })
  }
  const onChangeCompleteFocal = (value: number | null) => {
    post('focusByStep', {
      direction: value,
      controlTag: '',
      enable: value ? 'true' : 'false',
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
      <SliderValue
        disabled={disabled}
        // disabled={false}
        onChange={onChangeCompleteFocal}
        title={t('common.zoom.focal')}
      />

      <Button
        size="small"
        disabled={disabled}
        onClick={() => {
          !disabled && run()
        }}
      >
        <Icon id="icon-suofnagzishiying" />
        {t('common.zoom.auto')}
      </Button>
    </Flex>
  )
}

export default React.memo(ZoomControl)
