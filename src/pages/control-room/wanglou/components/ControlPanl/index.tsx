import AppCollapse from '@/components/AppCollapse'
import RadarData from './RadarData'
import TurntableControl from './TurntableControl'
import ZoomControl from './ZoomControl'

const ControlPanl: React.FC = () => {
  const { t } = useTranslation()
  return (
    <AppCollapse
      className="border-x-0 border-b-0 overflow-y-auto h-full"
      //   accordion
      defaultActiveKey={['1', '2', '3', '4']}
      items={[
        {
          label: t('device.radar.range.title'),
          key: '1',
          children: <RadarData />,
        },
        {
          label: t('ja-zhuan-tai-kong-zhi'),
          key: '2',
          children: <TurntableControl />,
        },
        {
          label: t('device.ir.control.title'),
          key: '3',
          children: <ZoomControl deviceType={'INFRARED_CAMERA'} />,
        },
        {
          label: t('device.vl.control.title'),
          key: '4',
          children: <ZoomControl deviceType={'VISIBLE_LIGHT_CAMERA'} />,
        },
      ]}
    />
  )
}

export default ControlPanl
