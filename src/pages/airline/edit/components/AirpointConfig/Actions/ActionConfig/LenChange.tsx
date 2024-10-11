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
  return (
    <div>
      <div className={styles.subTitle}>
        <IconCameraSwitch />
        <span className={styles.text}>镜头切换</span>
      </div>
      <div className="flex gap-3">
        <span className="w-16 text-fore">执行时机</span>
        <Radio.Group
          options={[
            { label: '到达时', value: 'ARRIVE' },
            { label: '离开时', value: 'LEAVE' },
          ]}
          value={config.actionTiming}
          onChange={(e) =>
            onChange({ ...config, actionTiming: e.target.value })
          }
        />
      </div>
      <div className="flex gap-3 mt-1">
        <span className="w-16 text-fore">镜头</span>
        <Radio.Group
          options={[
            { label: '广角', value: 'wide' },
            { label: '红外', value: 'ir' },
            { label: '变焦', value: 'zoom' },
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
