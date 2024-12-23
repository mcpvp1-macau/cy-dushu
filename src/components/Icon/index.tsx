import clsx from 'clsx'

type PropsType = {
  id: string
  className?: string
  onClick?: () => void
}

const Icon: FC<PropsType> = (props) => {
  const { id, className, onClick } = props
  return (
    <svg
      className={clsx(
        'w-[1em] h-[1em] align-[-0.15em] fill-current overflow-hidden',
        className,
      )}
      aria-hidden="true"
      onClick={onClick}
    >
      <use xlinkHref={`#${id}`}></use>
    </svg>
  )
}

export default Icon
