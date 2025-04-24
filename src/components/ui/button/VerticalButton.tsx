import { Button, GetProps } from 'antd'
import { memo, type FC } from 'react'

type PropsType = GetProps<typeof Button> & {
  iconClassName?: string
  textClassName?: string
}

const VerticalIconButton: FC<PropsType> = memo(
  ({ icon, iconClassName, textClassName, ...props }) => {
    return (
      <Button {...props}>
        <div className="flex justify-center items-center flex-col">
          <div className={clsx('h-4', iconClassName)}>{icon}</div>
          <div className={clsx('h-4 text-sm', textClassName)}>
            {props.children}
          </div>
        </div>
      </Button>
    )
  },
)

VerticalIconButton.displayName = 'VerticalButton'

export default VerticalIconButton
