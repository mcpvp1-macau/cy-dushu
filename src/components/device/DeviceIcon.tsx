import { DeviceEnum, deviceIconMap } from '@/enum/device'
import { QuestionCircleFilled } from '@ant-design/icons'
import { memo, type FC } from 'react'

type PropsType = {
  type: DeviceEnum | string
  className?: string
}

/** 设备图标 */
const DeviceIcon: FC<PropsType> = memo(({ type, className }) => {
  const Icon = deviceIconMap[type] ?? QuestionCircleFilled

  return <Icon className={className} />
})

DeviceIcon.displayName = 'DeviceIcon'

export default DeviceIcon
