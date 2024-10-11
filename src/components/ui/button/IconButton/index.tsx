import { Tooltip, type TooltipProps } from 'antd'
import type { ButtonHTMLAttributes, FC, ReactNode } from 'react'
import styles from './index.module.less'

type PropsType = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean
  children: ReactNode
  toolTipProps?: TooltipProps
}

const IconButton: FC<PropsType> = ({
  children,
  toolTipProps,
  active,
  ...restProps
}) => {
  // 存在 toolTipProps 时，渲染带有 Tooltip 的按钮
  if (toolTipProps) {
    return (
      <Tooltip {...toolTipProps}>
        <button
          type="button"
          {...restProps}
          className={clsx(styles.iconButton, restProps.className, {
            [styles.active]: active,
          })}
        >
          {children}
        </button>
      </Tooltip>
    )
  }
  return (
    <button
      type="button"
      {...restProps}
      className={clsx(styles.iconButton, restProps.className, {
        [styles.active]: active,
      })}
    >
      {children}
    </button>
  )
}

export default IconButton
