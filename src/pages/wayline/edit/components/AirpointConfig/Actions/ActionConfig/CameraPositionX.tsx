import styles from './index.module.less'
import HSlider from '../../../HSlider'
import YTPHJ from '../../icons/YTPHJ'
import useAirlineConfigStore from '@/store/wayline/uav-airline/useAirlineConfig.store'
import { ActionCameraPositionType } from '@/store/wayline/uav-airline/types'
import { createPortal } from 'react-dom'

type ConfigType = ActionCameraPositionType['config']

type PropsType = {
  config: ConfigType
  onChange: (value: ConfigType) => unknown
}

const CameraPositionX: FC<PropsType> = ({ config, onChange }) => {
  const { t } = useTranslation()
  const currentBearing = useAirlineConfigStore((s) => s.bearing)

  let diff = Math.abs(currentBearing - (config.x ?? 0))
  if (diff > 180) {
    diff = 360 - diff
  }

  const warningShow = diff >= 45
  const errorShow = diff >= 90

  return (
    <div>
      <div className={styles.titleHeader}>
        <div className={styles.subTitle}>
          <YTPHJ />
          <span className={styles.text}>
            {t('wayline.waylinePoint.actions.CAMERA_POSITION_X.title')}
          </span>
        </div>
        <div>
          <span className={styles.important}>
            {(config?.x ?? 0).toFixed(1)}
          </span>
          °
        </div>
      </div>
      <HSlider
        value={config?.x ?? 0}
        min={-180}
        max={180}
        onChange={(value) => onChange({ x: Number(value.toFixed(2)) })}
      />
      {warningShow &&
        createPortal(
          <div
            className="z-50 text-white fixed bottom-6 left-1/2 transform -translate-x-1/2 p-3 py-6  whitespace-nowrap rounded"
            style={{
              background: errorShow
                ? 'rgba(214, 34, 38, 0.6)'
                : 'rgba(212, 107, 30, 0.75)',
              padding: '12px 24px',
              textAlign: 'center',
            }}
          >
            {errorShow
              ? '云台已达限位角度'
              : '当前角度可能会拍到飞行器脚架或桨叶'}
          </div>,
          document.body,
        )}
    </div>
  )
}

const memorizedCpn = memo(CameraPositionX)
memorizedCpn.displayName = 'CameraPositionX'

export default memorizedCpn
