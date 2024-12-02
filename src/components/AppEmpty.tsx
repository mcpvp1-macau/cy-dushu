import { Empty, GetProps } from 'antd'
import { type FC } from 'react'
import zanwushujuSvg from '@/assets/imgs/zanwushuju.svg'

type PropsType = GetProps<typeof Empty>

const AppEmpty: FC<PropsType> = ({ ...restProps }) => {
  restProps.description ??= '暂无数据'
  restProps.imageStyle ??= { height: 32 }

  return (
    <Empty
      image={zanwushujuSvg}
      {...restProps}
      className={clsx(
        'flex flex-col items-center justify-center my-3 opacity-50 text-xs',
        restProps.className,
      )}
    />
  )
}

export default AppEmpty
