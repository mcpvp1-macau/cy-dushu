import { Col, Form, InputNumber, Row } from 'antd'
import ControlItemSelect from '../../ControlItem'
import { useRebotDogControlRoomStore } from '@/store/context-store/useRebotDogControlRoom.store'
import { setDeviceProp } from '@/service/modules/device'
import { useAppMsg } from '@/hooks/useAppMsg'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'

type Props = unknown

const GimbalControl: FC<Props> = () => {
  const [form] = Form.useForm()
  const msgApi = useAppMsg()
  // const productKey = useUavControlRoomStore((s) => s.productKey)
  const productKey = useDeviceDetailStore(
    (s) =>
      s.deviceDetail?.productKey || s.deviceDetail?.deviceModel?.productKey,
  )!
  const deviceId = useRebotDogControlRoomStore((s) => s.deviceId)

  const gimbalPitch = useRebotDogControlRoomStore((s) =>
    Number(s.state?.gimbalPitch?.toFixed(2)),
  )

  const gimbalYaw = useRebotDogControlRoomStore((s) =>
    Number(s.state?.gimbalYaw?.toFixed(2)),
  )

  const setDevice = async (values: Record<string, any>) => {
    const res = await setDeviceProp(productKey, deviceId, values)
    if (res.code === 'SUCCESS') {
      msgApi.success('设置成功')
    } else {
      msgApi.error('设置失败')
    }
  }

  const onValuesChange = (changedValues: {
    [key: string]: string | number
  }) => {
    const colum = Object.keys(changedValues)?.[0]
    switch (colum) {
      case 'gimbalPitch':
        setDevice(changedValues)
        break
      case 'gimbalYaw':
        setDevice(changedValues)
        break
      default:
        break
    }
  }

  useEffect(() => {
    form.setFieldValue('gimbalPitch', gimbalPitch || 0)
  }, [gimbalPitch])

  useEffect(() => {
    form.setFieldValue('gimbalYaw', gimbalYaw || 0)
  }, [gimbalYaw])

  return (
    <div className="pt-[10px]">
      <Form
        name="z60r"
        labelCol={{ span: 10 }}
        wrapperCol={{ span: 14 }}
        style={{ maxWidth: 600 }}
        initialValues={{ remember: true }}
        onValuesChange={onValuesChange}
        form={form}
      >
        <Row gutter={10}>
          <Col span={12}>
            <ControlItemSelect
              serviceName="setGimbalMode"
              label="云台模式"
              valueName="gimbalMode"
            />
          </Col>
          <Col span={12}>
            <Form.Item name="gimbalPitch" label="俯仰角°">
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <ControlItemSelect
              serviceName="cameraFingerModeControl"
              label="指点模式"
              valueName="fingerMode"
            />
          </Col>
          <Col span={12}>
            <Form.Item name="gimbalYaw" label="航向角°">
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  )
}

export default memo(GimbalControl)
