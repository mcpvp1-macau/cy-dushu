import { FormInstance } from 'antd'

type PropsType = {
  data: API_DEVICE.domain.Device
  deviceId?: string
  form: FormInstance
}

const ConfigParams: React.FC<PropsType> = ({ data, deviceId, form: _form }) => {
  const { name, deviceModel } = data
  const { productKey } = deviceModel!
  const { configs } = deviceModel || {}

  const render = () => {
    return '---'
  }
  useEffect(() => {}, [deviceId, productKey])
  return (
    <div>
      <div>{name}</div>
      <div className="grid grid-cols-2">{configs?.map(render)}</div>
    </div>
  )
}

export default ConfigParams
