import useDeviceListConfigStore from '@/store/useDeviceListConfig.store'
import { Checkbox } from 'antd'
import { pick } from 'lodash'
import { HTMLAttributes } from 'react'
import { useShallow } from 'zustand/react/shallow'

type PropsType = HTMLAttributes<HTMLDivElement>

/** 资源状态选择器 */
const SourceStatusCheckGroup: FC<PropsType> = memo((props) => {
  const { setDeviceStatus, isOnline, isTask, isNotTask } =
    useDeviceListConfigStore(
      useShallow((s) =>
        pick(s, ['isOnline', 'isTask', 'isNotTask', 'setDeviceStatus']),
      ),
    )

  const { t } = useTranslation()

  return (
    <div {...props}>
      {(
        [
          ['isOnline', isOnline, t('source.status.online')],
          ['isTask', isTask, t('source.status.isTask')],
          ['isNotTask', isNotTask, t('source.status.isNotTask')],
        ] as const
      ).map(([prop, value, label]) => (
        <Checkbox
          checked={value}
          key={prop}
          onChange={(e) => setDeviceStatus({ [prop]: e.target.checked })}
        >
          {label}
        </Checkbox>
      ))}
    </div>
  )
})

SourceStatusCheckGroup.displayName = 'SourceStatusCheckGroup'

export default SourceStatusCheckGroup
