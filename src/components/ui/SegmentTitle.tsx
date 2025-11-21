type PropsType = {
  title: React.ReactNode
  className?: string
}

const SegmentTitle: FC<PropsType> = memo((props) => {
  return (
    <div className={clsx('flex items-center gap-2', props.className)}>
      <div className="h-[10px] w-[2px] rounded bg-green-500"></div>
      {props.title}
    </div>
  )
})

SegmentTitle.displayName = 'SegmentTitle'

export default SegmentTitle
