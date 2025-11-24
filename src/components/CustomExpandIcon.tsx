import IconExpand from '@/assets/icons/jsx/IconExpand'
import { Collapse, GetProps } from 'antd'
import LiqunTippy from './ui/LiqunTippy'

// 拿到 Collapse 组件中 expandIcon 的类型的函数中的第一个参数
type CustomExpand = Parameters<
  NonNullable<GetProps<typeof Collapse>['expandIcon']>
>[0]

type PropsType = CustomExpand

const CustomExpandIcon: FC<PropsType> = ({ isActive, ...restProps }) => {
  const title = isActive ? '收起' : '展开'
  const icon = (
    <IconExpand
      className={clsx(
        'text-xs transition-transform duration-300',
        restProps.className,
      )}
      style={{
        transform: `rotate(${isActive ? 0 : -90}deg)`,
      }}
    />
  )
  return (
    <LiqunTippy content={title}>
      <span>{icon}</span>
    </LiqunTippy>
  )
}

export default CustomExpandIcon
