import { ButtonHTMLAttributes } from 'react'

type PropsType = ButtonHTMLAttributes<HTMLButtonElement>

const TextButton: FC<PropsType> = memo((props) => {
  return (
    <button
      {...props}
      className={clsx(
        'text-primary hover:text-primary-color-4',
        {
          'opacity-80': props.disabled,
          'cursor-not-allowed': props.disabled,
        },
        props.className,
      )}
    ></button>
  )
})

TextButton.displayName = 'TextButton'

export default TextButton
