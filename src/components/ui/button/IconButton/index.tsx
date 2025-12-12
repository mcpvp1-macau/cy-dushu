import { GetProps, Tooltip, type TooltipProps } from 'antd'
import type { ButtonHTMLAttributes, FC, ReactNode } from 'react'
import Tippy from '@tippyjs/react'

type PropsType = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean
  children: ReactNode
  /** @deprecated 使用 tippyProps 替代 */
  toolTipProps?: TooltipProps
  tippyProps?: GetProps<typeof Tippy>
}

const IconButton: FC<PropsType> = ({
  children,
  toolTipProps,
  active,
  tippyProps,
  ...restProps
}) => {
  const buttonClassName = clsx(
    'm-0 p-0 outline-none bg-transparent border-0 cursor-pointer text-[rgb(var(--fore-color))]',
    'hover:text-[rgb(var(--primary-color))]',
    'disabled:cursor-not-allowed disabled:text-[rgb(var(--fore-color))] disabled:opacity-50',
    '[&>*]:transition-[color] [&>*]:duration-200 [&>*]:ease-linear',
    restProps.className,
    {
      'text-[rgb(var(--primary-color))]': active,
    },
  )

  // 存在 toolTipProps 时，渲染带有 Tooltip 的按钮
  if (toolTipProps) {
    return (
      <Tooltip {...toolTipProps}>
        <button
          type="button"
          {...restProps}
          className={buttonClassName}
        >
          {children}
        </button>
      </Tooltip>
    )
  }
  if (tippyProps) {
    return (
      <Tippy
        theme="liqun"
        {...tippyProps}
        content={<div className="p-1.5">{tippyProps.content}</div>}
      >
        <button
          type="button"
          {...restProps}
          className={buttonClassName}
        >
          {children}
        </button>
      </Tippy>
    )
  }
  return (
    <button
      type="button"
      {...restProps}
      className={buttonClassName}
    >
      {children}
    </button>
  )
}

export default IconButton
