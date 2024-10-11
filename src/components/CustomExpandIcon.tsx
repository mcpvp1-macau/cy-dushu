import IconExpand from '@/assets/icons/jsx/IconExpand'
import { Collapse, GetProps, Tooltip } from 'antd'

// 拿到 Collapse 组件中 expandIcon 的类型的函数中的第一个参数
type CustomExpand = Parameters<
  NonNullable<GetProps<typeof Collapse>['expandIcon']>
>[0]

type PropsType = CustomExpand

const CustomExpandIcon: FC<PropsType> = ({ isActive, ...restProps }) => {
  const tooltipTitle = isActive ? '收起' : '展开'
  const icon = (
    <IconExpand
      className={clsx(
        'text-fore text-xs transition-transform duration-300',
        restProps.className,
      )}
      style={{
        transform: `rotate(${isActive ? 0 : -90}deg)`,
      }}
    />
  )
  return (
    <Tooltip title={tooltipTitle}>
      <span>{icon}</span>
    </Tooltip>
  )
}

export default CustomExpandIcon
