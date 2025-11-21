import ZoomSlider from '@/components/device/ZoomSlider'
import useUavZoomFactorChange from '../hooks/useZoomFactorChange'
import mitt from 'mitt'
import { useLatest } from 'ahooks'

type PropsType = unknown

export const uavControlRoomZoomEmitter = mitt<{
  zoom: number
  gamepadZoom: boolean
}>()

const Zoom: FC<PropsType> = memo(() => {
  const [value, setValue] = useUavZoomFactorChange()
  const handleWheel = useMemoizedFn((e: React.WheelEvent<HTMLDivElement>) => {
    setValue((v) => v - Math.sign(e.deltaY))
  })

  const valueRef = useLatest(value)
  useEffect(() => {
    const handler = (delta: number) => {
      setValue((v) => v + delta)
    }

    const gamePadZoomHandler = (bigger: boolean) => {
      let delta = bigger ? 1 : -1
      if (valueRef.current > 30) {
        delta *= 10
      } else if (value > 20) {
        delta *= 3
      } else if (value > 10) {
        delta *= 2
      }
      setValue((v) => v + delta)
    }

    uavControlRoomZoomEmitter.on('zoom', handler)
    uavControlRoomZoomEmitter.on('gamepadZoom', gamePadZoomHandler)
    return () => {
      uavControlRoomZoomEmitter.off('zoom', handler)
      uavControlRoomZoomEmitter.off('gamepadZoom', gamePadZoomHandler)
    }
  }, [])

  return (
    <div className="absolute right-3 bottom-11 h-[160px] bg-ground-1/70 backdrop-blur-sm w-16 rounded">
      <ZoomSlider value={value} onChange={setValue} onWheel={handleWheel} />
    </div>
  )
})

Zoom.displayName = 'Zoom'

export default Zoom
