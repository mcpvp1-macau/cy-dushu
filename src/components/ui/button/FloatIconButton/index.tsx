import { memo, type FC } from 'react'
import IconButton from '../IconButton'
import { GetProps } from 'antd'

type PropsType = GetProps<typeof IconButton> & {
  variant?: 'borderless' | 'bordered'
  active?: boolean
}

/** 浮动按钮 */
const FloatIconButton: FC<PropsType> = memo(
  ({ variant = 'bordered', active, className, ...props }) => {
    return (
      <div
        className={clsx(
          'w-[28px] h-[28px] flex justify-center items-center box-content bg-[#16202BCC] hover:bg-ground-2',
          variant === 'bordered' &&
            'border border-solid border-ground-4 rounded',
          active && 'bg-ground-2',
          className,
        )}
      >
        <IconButton className="size-full" active={active} {...props} />
      </div>
    )
  },
)

FloatIconButton.displayName = 'FloatIconButton'

export default FloatIconButton
