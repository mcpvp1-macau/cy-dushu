import ZoomSlider from '@/components/device/ZoomSlider'
import useUavZoomFactorChange from '../hooks/useZoomFactorChange'

type PropsType = unknown

const Zoom: FC<PropsType> = memo(() => {
  const [value, setValue] = useUavZoomFactorChange()
  const handleWheel = useMemoizedFn((e: React.WheelEvent<HTMLDivElement>) => {
    setValue((v) => v - Math.sign(e.deltaY))
  })

  return (
    <div className="absolute right-3 bottom-11 h-[160px] bg-ground-100 w-[72px] rounded">
      <ZoomSlider value={value} onChange={setValue} onWheel={handleWheel} />
    </div>
  )
})

Zoom.displayName = 'Zoom'

export default Zoom
