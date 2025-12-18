import { Col, Form, Row } from 'antd'
import { clamp } from 'lodash'
import ControlItem from '../ControlItem'
import PitchControl from './PitchControl'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { usePostDeviceService } from '@/hooks/device/usePostDeviceService'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'

const serviceName = 'searchLightValueSet'

const PFL01Mounts: React.FC = () => {
  const [form] = Form.useForm()
  const deviceModel = useDeviceDetailStore((s) => s.deviceDetail?.deviceModel)
  const pitchField = useMemo(() => {
    const service = deviceModel?.services?.[serviceName]
    return (
      service?.inputMethodFields?.find((item) => item.identifier === 'pitch') ??
      service?.inputMethodFields?.find(
        (item) => item.identifier === 'lightPitch',
      )
    )
  }, [deviceModel])

  const pitchIdentifier = pitchField?.identifier
  const pitchSpecs = pitchField?.dataType?.specs as
    | { min?: number; max?: number; step?: number }
    | undefined

  const productKey = useDeviceDetailStore(
    (s) =>
      s.deviceDetail?.productKey || s.deviceDetail?.deviceModel?.productKey,
  )!
  const deviceId = useUavControlRoomStore((s) => s.deviceId)
  const postSerivce = usePostDeviceService(productKey, deviceId)
  const lightPitch = useUavControlRoomStore((s) =>
    pitchIdentifier ? s.state?.[pitchIdentifier] : undefined,
  )

  const onChangePitch = (value: number) => {
    if (!pitchIdentifier) return
    const currentPitch = Number(lightPitch ?? 0)
    const min = typeof pitchSpecs?.min === 'number' ? pitchSpecs.min : -Infinity
    const max = typeof pitchSpecs?.max === 'number' ? pitchSpecs.max : Infinity
    const step = typeof pitchSpecs?.step === 'number' ? pitchSpecs.step : null

    const next = clamp(currentPitch + value, min, max)
    const normalize = step && step > 0 ? Math.round(next / step) * step : next

    postSerivce(serviceName, {
      [pitchIdentifier]: Number.isFinite(normalize) ? normalize : next,
    })
  }

  return (
    <div className="pl-[12px] pr-[12px] pt-[12px] space-y-3">
      <div className="flex justify-center">
        <PitchControl
          onChange={onChangePitch}
          value={Number(lightPitch ?? 0)}
        />
      </div>
      <Form
        name="xxx"
        labelCol={{ span: 10 }}
        wrapperCol={{ span: 14 }}
        style={{ maxWidth: 600 }}
        initialValues={{ remember: true }}
        form={form}
      >
        <Row gutter={10}>
          <Col span={24}>
            <ControlItem
              serviceName={serviceName}
              label="灯光"
              valueName="lightStatus"
            />
          </Col>
          <Col span={24}>
            <ControlItem
              serviceName={serviceName}
              label="亮度"
              valueName="lightStrength"
              paramName="lightStrength"
              type="slider"
            />
          </Col>
        </Row>
      </Form>
    </div>
  )
}

export default PFL01Mounts
