type PropsType = {
  title: React.ReactNode
}

const SegmentTitle: FC<PropsType> = memo((props) => {
  return (
    <div className="flex gap-1.5 items-center">
      <div className="h-[10px] w-[2px] rounded bg-green-500"></div>
      {props.title}
    </div>
  )
})

SegmentTitle.displayName = 'SegmentTitle'

export default SegmentTitle
