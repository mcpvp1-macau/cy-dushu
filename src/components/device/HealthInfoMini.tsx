import { InfoCircleOutlined } from '@ant-design/icons'
import { Dropdown } from 'antd'
import HealthInfoList from './HealthInfoList'

type PropsType = {
  healthInfo: string[]
}

/** 健康信息 Icon */
const HealthInfoMini: FC<PropsType> = memo(({ healthInfo }) => {
  return (
    <Dropdown dropdownRender={() => <HealthInfoList data={healthInfo} />}>
      <InfoCircleOutlined
        className={clsx({
          'text-red-600': healthInfo[0]?.startsWith?.('Error'),
          'text-blue-600': healthInfo[0]?.startsWith?.('Info'),
          'text-yellow-600': healthInfo[0]?.startsWith?.('Warn'),
        })}
      />
    </Dropdown>
  )
})

HealthInfoMini.displayName = 'HealthInfoMini'

export default HealthInfoMini
