import { memo, type FC } from 'react'
import styles from './index.module.less'
import HSlider from '../../../HSlider'
import YTPHJ from '../../icons/YTPHJ'
import { ActionCameraPositionType } from '@/store/uav/uav-airline/types'

type ConfigType = ActionCameraPositionType['config']

type PropsType = {
  config: ConfigType
  onChange: (value: ConfigType) => unknown
}

const CameraPositionY: FC<PropsType> = ({ config, onChange }) => {
  return (
    <div>
      <div className={styles.titleHeader}>
        <div className={styles.subTitle}>
          <YTPHJ />
          <span className={styles.text}>云台俯仰角</span>
        </div>
        <div>
          <span className={styles.important}>
            {(config?.y ?? 0).toFixed(1)}
          </span>
          °
        </div>
      </div>
      <HSlider
        value={config?.y ?? 0}
        min={-120}
        max={45}
        onChange={(value) => onChange({ y: Number(value.toFixed(2)) })}
      />
    </div>
  )
}

const memorizedCpn = memo(CameraPositionY)
memorizedCpn.displayName = 'CameraPositionY'

export default memorizedCpn
