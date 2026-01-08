import clsx from 'clsx'
import { ButtonHTMLAttributes, FC, memo } from 'react'

type PropsType = ButtonHTMLAttributes<HTMLButtonElement> & { danger?: boolean }

const TextButton: FC<PropsType> = memo(({ danger, className, ...rest }) => {
  const isDisabled = !!rest.disabled

  return (
    <button
      {...rest}
      className={clsx(
        danger ? 'text-red-500' : 'text-primary',
        !isDisabled &&
          (danger ? 'hover:text-red-400' : 'hover:text-primary-color-4'),
        {
          'opacity-80': isDisabled,
          'cursor-not-allowed': isDisabled,
        },
        className,
      )}
    ></button>
  )
})

TextButton.displayName = 'TextButton'

export default TextButton
