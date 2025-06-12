import { memo, type FC, type ReactNode } from 'react'
import styles from './index.module.less'
import TakeOffPointConfig from './components/TakeOffPointConfig'
import TakePhotoConfig from './components/TakePhotoConfig'
import AirlineHeightConfig from './components/HeightConfig'
import AirlineSpeedConfig from './components/SpeedConfig'
import AdvancedConfig from './components/AdvancedConfig'
import TakeoffSpeedConfig from './components/TakeOffSpeedConfig'
// import { useModel } from '@umijs/max';
// import { pick } from 'lodash'
import { takePhotoIgnoreDevices } from './constant/ignore-device'
import GoHomeHeightConfig from './components/GoHomeHeightConfig'
import RoadNetworkMode from './components/RoadNetworkMode'

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
      {pilot}
      {!takePhotoIgnoreDevices.includes(modelName) && <TakePhotoConfig />}
      {/* 爬升模式设置 */}
      {/* <FlyToWaylineModeConfig /> */}
      <AirlineHeightConfig />
      <GoHomeHeightConfig />
      <AirlineSpeedConfig />
      {!takePhotoIgnoreDevices.includes(modelName) && <TakeoffSpeedConfig />}
      <AdvancedConfig />
    </div>
  )
}

export default memo(AirlineConfig)
