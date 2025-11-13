import styles from './index.module.less'
import TakeOffPointConfig from './components/TakeOffPointConfig'
import TakePhotoConfig from './components/TakePhotoConfig'
import AirlineHeightConfig from './components/HeightConfig'
import AirlineSpeedConfig from './components/SpeedConfig'
import AdvancedConfig from './components/AdvancedConfig'
import TakeoffSpeedConfig from './components/TakeOffSpeedConfig'
import { takePhotoIgnoreDevices } from './constant/ignore-device'
import GoHomeHeightConfig from './components/GoHomeHeightConfig'
import RoadNetworkMode from './components/RoadNetworkMode'
import RelayDeviceConfig from './components/RelayDeviceConfig'
import Flight3D from './components/Flight3D'

type PropsType = {
  info: ReactNode
  pilot?: ReactNode
}

/** 航线设置 */
const AirlineConfig: FC<PropsType> = ({ info, pilot }) => {
  // const { currentRoute } = useModel('leftNav', (m) =>
  //   pick(m, ['currentRoute']),
  // );

  const modelName = 'M300 RTK'

  return (
    <div className={styles.airlineConfig}>
      {info}
      <TakeOffPointConfig />
      <RoadNetworkMode />
      {globalConfig.useFlight3D && <Flight3D />}
      {pilot}
      {!takePhotoIgnoreDevices.includes(modelName) && <TakePhotoConfig />}
      {/* 爬升模式设置 */}
      {/* <FlyToWaylineModeConfig /> */}
      <AirlineHeightConfig />
      <GoHomeHeightConfig />
      <AirlineSpeedConfig />
      {!takePhotoIgnoreDevices.includes(modelName) && <TakeoffSpeedConfig />}
      <AdvancedConfig />
      <RelayDeviceConfig />
    </div>
  )
}

export default memo(AirlineConfig)
