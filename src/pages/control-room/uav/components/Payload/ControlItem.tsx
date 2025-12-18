import Select from '@/components/AntdOverride/Select'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import usePostDeviceService from '@/pages/right/DeviceDetail/hooks/usePostDeviceService'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { Form, Switch, Slider } from 'antd'

type Props = {
  serviceName: string
  label: string
  paramName?: string
  valueName: string
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

  const postSerivce = usePostDeviceService()
  const value = useUavControlRoomStore((s) => s.state?.[valueName])

  const inputField = useMemo(() => {
    const service = deviceModel?.services?.[serviceName]
    if (!paramName) return service?.inputMethodFields?.[0]
    return service?.inputMethodFields?.find(
      (item) => item.identifier === paramName,
    )
  }, [deviceModel?.services, paramName, serviceName])

  const { specs, name } = useMemo(() => {
    const inputSpecs = inputField?.dataType?.specs || {}
    return { specs: inputSpecs, name: inputField?.identifier }
  }, [inputField])

  const selectOptions = useMemo(
    () =>
      Object.entries(specs).map(([key, label]) => ({
        label: label as string,
        value: key,
      })),
    [specs],
  )

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
    if (!name) return
    const formName = `${serviceName}-${name}`
    if (type === 'select') {
      form.setFieldValue(formName, value)
    } else if (type === 'slider') {
      form.setFieldValue(formName, value)
      setSliderValue(value)
    } else {
      form.setFieldValue(formName, !!Number(value || 0))
    }
  }, [form, name, serviceName, type, value])

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
      <Select
        placeholder={label}
        options={selectOptions}
        onChange={onChange}
      ></Select>
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
