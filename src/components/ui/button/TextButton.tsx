import { ButtonHTMLAttributes } from 'react'

type PropsType = ButtonHTMLAttributes<HTMLButtonElement>

const TextButton: FC<PropsType> = memo((props) => {
  return (
    <button
      {...props}
      className={clsx('text-primary', props.className)}
    ></button>
  )
})

TextButton.displayName = 'TextButton'

export default TextButton
