import styles from './index.module.less'
import { Radio } from 'antd'
import IconCameraMode from '@/assets/icons/jsx/IconCameraMode'

type ConfigType = {
  cameraMode: '0' | '1' // 0: 拍照, 1: 录像
}

type PropsType = {
  config: ConfigType
  onChange: (value: ConfigType) => unknown
}

const CameraModeSet: FC<PropsType> = ({ config, onChange }) => {
  const { t } = useTranslation()

  return (
    <div>
      <div className={styles.subTitle}>
        <IconCameraMode />
        <span className={styles.text}>
          {t('wayline.waylinePoint.actions.CAMERA_MODE_SET.title')}
        </span>
      </div>
      <div className="flex gap-3 mt-1">
        <Radio.Group
          options={[
            {
              label: t('controlRoom.uav.service.cameraMode.photo.title'),
              value: '0',
            },
            {
              label: t('controlRoom.uav.service.cameraMode.record.title'),
              value: '1',
            },
          ]}
          value={config.cameraMode}
          onChange={(e) => onChange({ ...config, cameraMode: e.target.value })}
        />
      </div>
    </div>
  )
}

const memorizedCpn = memo(CameraModeSet)
memorizedCpn.displayName = 'CameraModeSet'

export default memorizedCpn
