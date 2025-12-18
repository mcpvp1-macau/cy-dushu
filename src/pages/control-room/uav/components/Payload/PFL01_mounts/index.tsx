import { useCallback, useEffect, useMemo, useState } from 'react'
import { Col, Form, Row, Slider } from 'antd'
import { clamp } from 'lodash'
import Select from '@/components/AntdOverride/Select'
import PitchControl from './PitchControl'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { usePostDeviceService } from '@/hooks/device/usePostDeviceService'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'

const serviceName = 'searchLightValueSet'
const { Option } = Select

const PFL01Mounts: React.FC = () => {
  const [form] = Form.useForm()
  const deviceModel = useDeviceDetailStore((s) => s.deviceDetail?.deviceModel)
  const service = useMemo(
    () => deviceModel?.services?.[serviceName],
    [deviceModel?.services],
  )
  const getInputMethodField = useCallback(
    (identifier?: string) => {
      if (!identifier) {
        return service?.inputMethodFields?.[0]
      }
      return service?.inputMethodFields?.find(
        (item) => item.identifier === identifier,
      )
    },
    [service?.inputMethodFields],
  )
  const pitchField = useMemo(() => {
    return (
      service?.inputMethodFields?.find((item) => item.identifier === 'pitch') ??
      service?.inputMethodFields?.find(
        (item) => item.identifier === 'lightPitch',
      )
    )
  }, [service?.inputMethodFields])
  const lightStatusField = useMemo(
    () => getInputMethodField('lightStatus'),
    [getInputMethodField],
  )
  const lightStrengthField = useMemo(
    () => getInputMethodField('lightStrength'),
    [getInputMethodField],
  )

  const pitchIdentifier = pitchField?.identifier
  const pitchSpecs = pitchField?.dataType?.specs as
    | { min?: number; max?: number; step?: number }
    | undefined
  const lightStatusIdentifier = lightStatusField?.identifier
  const lightStrengthIdentifier = lightStrengthField?.identifier
  const lightStatusSpecs = (lightStatusField?.dataType?.specs || {}) as Record<
    string,
    string
  >
  const lightStrengthSpecs = lightStrengthField?.dataType?.specs as
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
  const lightStatus = useUavControlRoomStore((s) =>
    lightStatusIdentifier ? s.state?.[lightStatusIdentifier] : undefined,
  )
  const lightStrength = useUavControlRoomStore((s) =>
    lightStrengthIdentifier ? s.state?.[lightStrengthIdentifier] : undefined,
  )

  const [lightStrengthValue, setLightStrengthValue] = useState(
    Number(lightStrength ?? 0),
  )

  const lightStatusFormName = useMemo(
    () => `${serviceName}-${lightStatusIdentifier ?? 'lightStatus'}`,
    [lightStatusIdentifier],
  )
  const lightStrengthFormName = useMemo(
    () => `${serviceName}-${lightStrengthIdentifier ?? 'lightStrength'}`,
    [lightStrengthIdentifier],
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

  useEffect(() => {
    if (lightStatusIdentifier) {
      form.setFieldValue(lightStatusFormName, lightStatus)
    }
  }, [form, lightStatus, lightStatusFormName, lightStatusIdentifier])

  useEffect(() => {
    if (lightStrengthIdentifier) {
      const normalized = Number(lightStrength ?? 0)
      form.setFieldValue(lightStrengthFormName, normalized)
      setLightStrengthValue(normalized)
    }
  }, [
    form,
    lightStrength,
    lightStrengthFormName,
    lightStrengthIdentifier,
  ])

  const onChangeLightStatus = (value: string | number) => {
    if (!lightStatusIdentifier) return
    postSerivce(serviceName, { [lightStatusIdentifier]: value })
  }

  const onChangeLightStrength = (value: number) => {
    setLightStrengthValue(value)
  }

  const onChangeLightStrengthComplete = (value: number) => {
    if (!lightStrengthIdentifier) return
    postSerivce(serviceName, { [lightStrengthIdentifier]: value })
  }

  const sliderMin =
    typeof lightStrengthSpecs?.min === 'number' ? lightStrengthSpecs.min : 0
  const sliderMax =
    typeof lightStrengthSpecs?.max === 'number' ? lightStrengthSpecs.max : 100

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
            <Form.Item
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 16 }}
              name={lightStatusFormName}
              label="灯光"
            >
              <Select
                placeholder="灯光"
                value={lightStatus}
                onChange={onChangeLightStatus}
              >
                {Object.entries(lightStatusSpecs).map(([key, value]) => (
                  <Option key={key} value={key}>
                    {value}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 20 }}
              name={lightStrengthFormName}
              label="亮度"
            >
              <div className="flex">
                <Slider
                  value={lightStrengthValue}
                  className="ml-[10px] w-[90%]"
                  onChange={onChangeLightStrength}
                  onChangeComplete={onChangeLightStrengthComplete}
                  min={sliderMin}
                  max={sliderMax}
                  step={lightStrengthSpecs?.step}
                />
                <span className="leading-[32px]">
                  {Number(lightStrengthValue ?? 0)}%
                </span>
              </div>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  )
}

export default PFL01Mounts
