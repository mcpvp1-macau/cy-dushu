import { Spin } from 'antd'

type PropsType = {
  className?: string
}

const AppSpin: FC<PropsType> = ({ className }) => {
  return (
    <div className={clsx('text-center m-3', className)}>
      <Spin />
    </div>
  )
}

export default AppSpin
