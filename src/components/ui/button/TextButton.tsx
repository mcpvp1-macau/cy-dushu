import clsx from 'clsx'
import { ButtonHTMLAttributes, FC, memo } from 'react'

type PropsType = ButtonHTMLAttributes<HTMLButtonElement> & { danger?: boolean }

const TextButton: FC<PropsType> = memo(({ danger, className, ...rest }) => {
  return (
    <button
      {...rest}
      className={clsx(
        danger ? 'text-red-500' : 'text-primary',
        danger ? 'hover:text-red-400' : 'hover:text-primary-color-4',
        {
          'opacity-80': rest.disabled,
          'cursor-not-allowed': rest.disabled,
        },
        className,
      )}
    ></button>
  )
})

TextButton.displayName = 'TextButton'

export default TextButton
