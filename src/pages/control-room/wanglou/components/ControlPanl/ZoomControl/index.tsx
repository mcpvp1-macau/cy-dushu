import { Button, Flex } from 'antd'
import SliderValue from './SliderValue'
import Icon from '@/components/Icon'
import { useWangLouControlRoomStore } from '@/store/context-store/useWangLouControlRoom.store'
import { usePostDeviceService } from '@/hooks/device/usePostDeviceService'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { useSliderValue } from '../../../hooks/useSliderValue'

interface Props {
  deviceType: string
}

const ZoomControl: React.FC<Props> = ({ deviceType }) => {
  const data = useDeviceDetailStore((s) => s.deviceDetail)
  const childData = data?.childDevice?.find(
    (item: any) => item.deviceType === deviceType,
  )
  const { focalProps, zoomProps } = useSliderValue({
    data: childData!,
  })
  const disabled = useWangLouControlRoomStore((s) => !s.hasControlPower)
  const uuid = useWangLouControlRoomStore((s) => s.uuid)
  const post = usePostDeviceService(data?.productKey || '', data?.deviceId || '')
  const run = () => {
    post('autoFocus', {
      controlTag: uuid,
    })
  }
  return (
    <Flex gap={12} vertical className={'p-[10px] text-[12px]'}>
      <SliderValue
        value={zoomProps.value}
        disabled={disabled}
        // disabled={false}
        onChange={zoomProps?.onChangeComplete}
        sliderProps={zoomProps}
        title={'变倍（X）'}
        unit={'X'}
      />
      <SliderValue
        value={focalProps.value}
        disabled={disabled}
        // disabled={false}
        onChange={focalProps?.onChangeComplete}
        sliderProps={focalProps}
        title={'调焦（%）'}
        unit={'%'}
      />

      <Button
        size="small"
        disabled={disabled}
        onClick={() => {
          !disabled && run()
        }}
      >
        <Icon id="icon-suofnagzishiying" />
        自动聚焦
      </Button>
    </Flex>
  )
}

export default ZoomControl
