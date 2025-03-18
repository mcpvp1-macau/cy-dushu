import { memo, type FC } from 'react'
import styles from './index.module.less'
import WRJXT from '../../icons/WRJXT'
import HNumber from '../../../HNumber'
import { ActionHoverType } from '@/store/wayline/uav-airline/types'

type ConfigType = ActionHoverType['config']

type PropsType = {
  config: ConfigType
  onChange: (value: ConfigType) => unknown
}

const HoverTime: FC<PropsType> = ({ config, onChange }) => {
  const { t } = useTranslation()

  return (
    <div>
      <div className={styles.subTitle}>
        <WRJXT />
        <span className={styles.text}>
          {t('wayline.waylinePoint.actions.HOVER.title')}
        </span>
      </div>
      <HNumber
        value={config.hoverTime || 0}
        unit="s"
        negatives={[-10, -1]}
        positives={[1, 10]}
        onChange={(value) => onChange({ hoverTime: value })}
      />
    </div>
  )
}

const memorizedCpn = memo(HoverTime)
memorizedCpn.displayName = 'HoverTime'

export default memorizedCpn
