import { usePostDeviceService } from '@/hooks/device/usePostDeviceService'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { useRebotDogControlRoomStore } from '@/store/context-store/useRebotDogControlRoom.store'
import { Form, Select, Switch, Slider } from 'antd'
import { useEffect, useState } from 'react'
const { Option } = Select

type Props = {
  // deviceModel: API_DEVICE.domain.DeviceModel
  serviceName: string
  label: string
  paramName?: string
  valueName: string
  // postDevice?: (identifier: string, values: any) => void
  type?: 'select' | 'switch' | 'slider'
}

const ControlItem: React.FC<Props> = (props) => {
  const {
    // deviceModel,
    serviceName,
    label,
    paramName,
    valueName,
    // postDevice,
    type = 'select',
  } = props

  const form = Form.useFormInstance()
  const deviceModel = useDeviceDetailStore((s) => s.deviceDetail?.deviceModel)

  // const productKey = useUavControlRoomStore((s) => s.productKey)
  const productKey = useDeviceDetailStore(
    (s) =>
      s.deviceDetail?.productKey || s.deviceDetail?.deviceModel?.productKey,
  )!
  const deviceId = useRebotDogControlRoomStore((s) => s.deviceId)
  const postSerivce = usePostDeviceService(productKey, deviceId)
  // const value = useModel('detailUav', (m) => m.state?.[valueName]);
  const value = useRebotDogControlRoomStore((s) => s.state?.[valueName])

  const getInputMethodField = (
    obj: API_DEVICE.domain.Service | undefined,
    identifier: string,
  ) => {
    if (!identifier) {
      return obj?.inputMethodFields?.[0]
    }
    return obj?.inputMethodFields?.find(
      (item) => item.identifier === identifier,
    )
  }

  const getSpecs = (serviceName: string, paramName?: string) => {
    const service = deviceModel?.services?.[serviceName]
    const param = getInputMethodField(service, paramName || '')
    const specs = param?.dataType?.specs || {}
    return { specs, name: param?.identifier }
  }

  const { specs, name } = getSpecs(serviceName, paramName)

  const onChange = (value: any) => {
    if (!name) return
    if (type === 'select') {
      postSerivce?.(serviceName, { [name]: value })
    } else if (type === 'slider') {
      postSerivce?.(serviceName, { [name]: value })
    } else {
      postSerivce?.(serviceName, { [name]: value ? 1 : 0 })
    }
  }

  const [sliderValue, setSliderValue] = useState(value)

  const onChangeValue = (value: number) => {
    setSliderValue(value)
  }

  useEffect(() => {
    if (type === 'select') {
      form.setFieldValue(serviceName + '-' + name, value)
    } else if (type === 'slider') {
      form.setFieldValue(serviceName + '-' + name, value)
      setSliderValue(value)
    } else {
      form.setFieldValue(serviceName + '-' + name, !!Number(value || 0))
    }
  }, [value])

  const render = () => {
    if (type === 'switch') {
      return (
        <Switch size="small" className="ml-[10px]" onChange={onChange}></Switch>
      )
    } else if (type === 'slider') {
      return (
        <div className="flex">
          <Slider
            value={sliderValue}
            className="ml-[10px] w-[90%]"
            onChangeComplete={onChange}
            onChange={onChangeValue}
          ></Slider>
          {type === 'slider' ? (
            <span className="leading-[32px]">{value || 0}%</span>
          ) : null}
        </div>
      )
    }
    return (
      <Select placeholder={label} onChange={onChange}>
        {Object.entries(specs).map(([key, label]) => (
          <Option key={key}>{label as string}</Option>
        ))}
      </Select>
    )
  }

  return (
    <>
      <Form.Item
        labelCol={{ span: type === 'slider' ? 4 : 8 }}
        wrapperCol={{ span: type === 'slider' ? 20 : 16 }}
        name={serviceName + '-' + name}
        label={label}
      >
        {render()}
      </Form.Item>
    </>
  )
}

export default ControlItem
