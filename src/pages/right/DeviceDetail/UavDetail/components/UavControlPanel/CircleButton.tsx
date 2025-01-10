import type { ButtonHTMLAttributes } from 'react'
import React from 'react'

const CircleButton: FC<ButtonHTMLAttributes<HTMLButtonElement>> = ({
  children,
  ...props
}) => {
  return (
    <button
      {...props}
      className={clsx(
        'absolute w-[26px] h-[26px] text-[9px] rounded-full disabled:cursor-not-allowed',
        'border border-solid border-primary text-primary',
        'hover:bg-primary hover:text-white',
        'disabled:border-ground-300 disabled:bg-ground-200 disabled:text-fore disabled:opacity-60',
        props.className,
      )}
    >
      {children}
    </button>
  )
}

export default React.memo(CircleButton)
