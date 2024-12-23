import { Tabs, TabsProps } from 'antd'
import GimbalControl from './GimbalControl'
import CameraControl from './CameraControl'

const MMC_Gimbal_Z60R: React.FC = () => {
  const [activeKey, setActiveKey] = useState('1')
  const items: TabsProps['items'] = [
    {
      key: '1',
      label: '云台控制',
      children: <GimbalControl />,
    },
    {
      key: '2',
      label: '相机控制',
      children: <CameraControl />,
    },
    // {
    //   key: '3',
    //   label: '高级控制',
    //   children: <SeniorControl />,
    // },
  ]
  return (
    <div className="pl-[12px] pr-[12px] pt-[12px]">
      <Tabs activeKey={activeKey} items={items} onChange={setActiveKey} />
    </div>
  )
}

export default MMC_Gimbal_Z60R
