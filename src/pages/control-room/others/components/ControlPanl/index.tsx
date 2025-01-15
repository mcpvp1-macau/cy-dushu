import AppCollapse from '@/components/AppCollapse'
import RadarData from './RadarData'
import TurntableControl from './TurntableControl'
import ZoomControl from './ZoomControl'

const ControlPanl: React.FC = () => {

  return (
    <AppCollapse
      className="border-x-0 border-b-0 overflow-y-auto h-full"
      //   accordion
      defaultActiveKey={['1', '2', '3', '4']}
      items={[
        {
          label: '雷达范围',
          key: '1',
          children: <RadarData />,
        },
        {
          label: '转台控制',
          key: '2',
          children: <TurntableControl />,
        },
        {
          label: '红外控制',
          key: '3',
          children: <ZoomControl deviceType={'INFRARED_CAMERA'} />,
        },
        {
          label: '可见光控制',
          key: '4',
          children: <ZoomControl deviceType={'VISIBLE_LIGHT_CAMERA'} />,
        },
      ]}
    />
  )
}

export default ControlPanl
