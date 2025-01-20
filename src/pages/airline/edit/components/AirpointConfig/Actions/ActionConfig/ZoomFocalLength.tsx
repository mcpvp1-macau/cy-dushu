import { memo, type FC } from 'react'
import styles from './index.module.less'
import HSlider from '../../../HSlider'
import XJBJ from '../../icons/XJBJ'
import { t } from 'i18next'

type ConfigType = {
  focalLength: number
}

type PropsType = {
  config: ConfigType
  onChange: (value: ConfigType) => unknown
}

const ZoomFocalLength: FC<PropsType> = ({ config, onChange }) => {
  return (
    <div>
      <div className={styles.titleHeader}>
        <div className={styles.subTitle}>
          <XJBJ />
          <span className={styles.text}>
            {t('wayline.waylinePoint.actions.ZOOM.title')}
          </span>
        </div>
        <div>
          <span className={styles.important}>
            {config?.focalLength?.toFixed(1)}
          </span>
          x
        </div>
      </div>
      <HSlider
        value={config?.focalLength || 2}
        min={2}
        max={200}
        onChange={(value) => onChange({ focalLength: value })}
      />
    </div>
  )
}

const memorizedCpn = memo(ZoomFocalLength)
memorizedCpn.displayName = 'ZoomFocalLength'

export default memorizedCpn
