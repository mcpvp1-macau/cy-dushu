import { Spin } from 'antd'

type PropsType = {
  className?: string
  size?: 'small' | 'default' | 'large'
}

const AppSpin: FC<PropsType> = ({ className, size }) => {
  return (
    <div className={clsx('text-center m-3', className)}>
      <Spin size={size ?? 'default'} />
    </div>
  )
}

export default AppSpin
