import { Empty, GetProps } from 'antd'
import zanwushujuSvg from '@/assets/imgs/zanwushuju.svg'
import { twMerge } from 'tailwind-merge'

type PropsType = GetProps<typeof Empty>

const AppEmpty: FC<PropsType> = ({ ...restProps }) => {
  const { t } = useTranslation()
  restProps.description ??= t('common.emptyContent')
  if (!restProps.styles?.image) {
    restProps.styles = { image: { height: 32 }, ...restProps.styles }
  }

  return (
    <Empty
      image={zanwushujuSvg}
      {...restProps}
      className={twMerge(
        'flex flex-col items-center justify-center py-3 opacity-50 text-xs',
        restProps.className,
      )}
    />
  )
}

export default AppEmpty
