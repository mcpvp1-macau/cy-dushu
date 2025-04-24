import { memo, type FC } from 'react'
import styles from './index.module.less'
import { Radio } from 'antd'
import IconCameraSwitch from '@/assets/icons/jsx/IconCameraSwitch'

type ConfigType = {
  actionTiming: string
  videoType: string
}

type PropsType = {
  config: ConfigType
  onChange: (value: ConfigType) => unknown
}

const LenChange: FC<PropsType> = ({ config, onChange }) => {
  const { t } = useTranslation()

  return (
    <div>
      <div className={styles.subTitle}>
        <IconCameraSwitch />
        <span className={styles.text}>
          {t('wayline.waylinePoint.actions.LEN_CHANGE.title')}
        </span>
      </div>
      <div className="flex gap-3">
        <span className="w-16 text-fore">
          {t('wayline.waylinePoint.actions.LEN_CHANGE.Timing.title')}
        </span>
        <Radio.Group
          options={[
            {
              label: t(
                'wayline.waylinePoint.actions.LEN_CHANGE.Timing.ARRIVE.title',
              ),
              value: 'ARRIVE',
            },
            {
              label: t(
                'wayline.waylinePoint.actions.LEN_CHANGE.Timing.LEAVE.title',
              ),
              value: 'LEAVE',
            },
          ]}
          value={config.actionTiming}
          onChange={(e) =>
            onChange({ ...config, actionTiming: e.target.value })
          }
        />
      </div>
      <div className="flex gap-3 mt-1">
        <span className="w-16 text-fore">{t('common.lens')}</span>
        <Radio.Group
          options={[
            { label: t('device.lens.wide.title'), value: 'wide' },
            { label: t('device.lens.ir.title'), value: 'ir' },
            { label: t('device.lens.zoom.title'), value: 'zoom' },
          ]}
          value={config.videoType}
          onChange={(e) => onChange({ ...config, videoType: e.target.value })}
        />
      </div>
    </div>
  )
}

const memorizedCpn = memo(LenChange)
memorizedCpn.displayName = 'HoverTime'

export default memorizedCpn
