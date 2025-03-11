import { usePostDeviceService } from '@/hooks/device/usePostDeviceService'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { Button, Col, Form, Popconfirm, Row } from 'antd'
// import ControlItemSelect from '../ControlItem'

const PARACHUTE: React.FC = () => {
  const connectState = useUavControlRoomStore(
    (s) => s.state.parachute?.connectState,
  )
  const parachuteState = useUavControlRoomStore(
    (s) => s.state.parachute?.parachuteState,
  )
  // const productKey = useUavControlRoomStore((s) => s.productKey)
  const productKey = useDeviceDetailStore(
    (s) =>
      s.deviceDetail?.productKey || s.deviceDetail?.deviceModel?.productKey,
  )!
  const deviceId = useUavControlRoomStore((s) => s.deviceId)

  const deviceModel = useDeviceDetailStore((s) => s.deviceDetail?.deviceModel)

  const postSerivce = usePostDeviceService(productKey, deviceId)

  const parachute = deviceModel?.properties.find(
    (item) => item.identifier === 'parachute',
  )

  const specs = parachute?.dataType?.specs as API_DEVICE.domain.StructSpec[]

  const connect = specs?.find((item) => item.identifier === 'connectState')
    ?.specs[connectState]

  const state = specs?.find((item) => item.identifier === 'parachuteState')
    ?.specs[parachuteState]

  const onConfirm = () => {
    postSerivce('uavCTRParachute', {}, '')
  }
  return (
    <div className="pt-[10px] pb-[10px]">
      <Form
        name="PARACHUTE"
        labelCol={{ span: 10 }}
        wrapperCol={{ span: 14 }}
        style={{ maxWidth: 600 }}
        initialValues={{ remember: true }}
      >
        <Row gutter={10}>
          <Col span={12}>
            <Form.Item
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 16 }}
              name={''}
              label={'连接'}
            >
              {connect || '-'}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 16 }}
              name={''}
              label={'状态'}
            >
              {state || '-'}
            </Form.Item>
          </Col>
          <Col span={24} className="text-center">
            <Popconfirm title="危险操作!" onConfirm={onConfirm}>
              <Button>强制打开降落伞</Button>
            </Popconfirm>
          </Col>
        </Row>
      </Form>
    </div>
  )
}

export default PARACHUTE
