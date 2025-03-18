import { memo, type FC } from 'react'
import styles from './index.module.less'
import FXQPHJ from '../../icons/FXQPHJ'
import HSlider from '../../../HSlider'
import { ActionRotateYawType } from '@/store/uav/uav-airline/types'

type ConfigType = ActionRotateYawType['config']

type PropsType = {
  config: ConfigType
  onChange: (value: ConfigType) => unknown
}

const AircraftHeading: FC<PropsType> = ({ config, onChange }) => {
  const { t } = useTranslation()

  return (
    <div>
      <div className={styles.titleHeader}>
        <div className={styles.subTitle}>
          <FXQPHJ />
          <span className={styles.text}>
            {t('wayline.waylinePoint.actions.ROTATE_YAW.title')}
          </span>
        </div>
        <div>
          <span className={styles.important}>
            {(config?.aircraftHeading ?? 0).toFixed(1)}
          </span>
          °
        </div>
      </div>
      <HSlider
        value={config?.aircraftHeading ?? 0}
        onChange={(value) => onChange({ aircraftHeading: value })}
        min={-180}
        max={180}
      />
    </div>
  )
}

const memorizedCpn = memo(AircraftHeading)
memorizedCpn.displayName = 'AircraftHeading'

export default memorizedCpn
