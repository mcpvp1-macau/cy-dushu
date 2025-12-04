import { Button } from 'antd'

import IconClose from '@/assets/icons/jsx/IconClose'
import ZoomSlider from '@/components/device/ZoomSlider'
import CesiumMap from '@/map/CesiumMap'
import useAirlineConfigStore from '@/store/wayline/uav-airline/useAirlineConfig.store'
import { limitNum } from '@/utils/math'

import DistanceMeasure from './components/DistanceMeasure'
import NarrowRect from './components/NarrowRect'
import CameraControl from './components/Controller'
import TopTip from './components/TopTip'

type PropsType = {
  onClose?: () => void
}

/** 摄像头视图地图 */
const CameraView: FC<PropsType> = memo(({ onClose }) => {
  const cameraInfo = useAirlineConfigStore((s) => s.cameraInfo)
  const fovMultipiler = useAirlineConfigStore((s) => s.uav.eoFovMultiplier)
  const updateUav = useAirlineConfigStore((s) => s.updateUav)
  const [viewType, setViewType] = useState<'wide' | 'narrow'>('narrow')
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{
    startX: number
    startY: number
    initX: number
    initY: number
  }>()

  const takeOffRefPoint = useAirlineConfigStore(
    (s) => s.airlineConfig.takeOffRefPoint,
  )

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    updateUav({
      eoFovMultiplier: limitNum(
        Math.floor(
          (useAirlineConfigStore.getState().uav.eoFovMultiplier ?? 2) -
            Math.sign(e.deltaY),
        ),
        2,
        200,
      ),
    })
  }

  const handleMouseMove = (event: MouseEvent) => {
    if (!dragRef.current) return

    const { startX, startY, initX, initY } = dragRef.current
    const nextX = initX + (event.clientX - startX)
    const nextY = initY + (event.clientY - startY)

    const container = containerRef.current

    if (container) {
      const { offsetWidth: width, offsetHeight: height } = container
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      const minX = -(viewportWidth - width - 52 - 38)
      const maxX = 52
      const minY = -14
      const maxY = viewportHeight - height - 52

      setOffset({
        x: limitNum(nextX, minX, maxX),
        y: limitNum(nextY, minY, maxY),
      })
      return
    }

    setOffset({ x: nextX, y: nextY })
  }

  const handleMouseUp = () => {
    dragRef.current = undefined
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault()

    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      initX: offset.x,
      initY: offset.y,
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  if (!cameraInfo || !takeOffRefPoint) {
    return null
  }

  return (
    <div
      className={clsx(
        'fixed top-[52px] right-[52px]',
        'w-[400px]',
        'border border-neutral-300 border-solid',
        'rounded overflow-hidden',
        'shadow-xl',
        'box-content',
      )}
      style={{
        height: (cameraInfo.sensorHeight / cameraInfo.sensorWidth) * 400,
        transform: `translate(${offset.x}px, ${offset.y}px)`,
      }}
      ref={containerRef}
      onWheel={handleWheel}
    >
      <div
        className="absolute left-0 right-0 top-0 h-8 cursor-move z-10"
        onMouseDown={handleMouseDown}
      />
      <CesiumMap id="airline-edit-camera-view-map" useToolBar={false}>
        <CameraControl viewType={viewType} />
        {viewType === 'wide' && <NarrowRect />}
        <DistanceMeasure />
      </CesiumMap>
      {/* 模式切换按钮 */}
      <Button
        className="absolute left-3 top-1/2"
        style={{ transform: 'translateY(-50%)' }}
        onClick={() => setViewType((t) => (t === 'narrow' ? 'wide' : 'narrow'))}
      >
        {viewType === 'narrow' ? '广角[1]' : `变焦[2]`}
      </Button>
      <div className="absolute top-3 left-3 z-20">
        <Button
          shape="circle"
          size="small"
          icon={<IconClose className="scale-110" />}
          onClick={onClose}
        />
      </div>
      {/* 焦距滑块 */}
      <div
        className="absolute right-0 top-0 bottom-5 w-[70px]"
        style={{
          background: 'linear-gradient(to right, transparent, #000a)',
        }}
      >
        <ZoomSlider
          value={fovMultipiler ?? 2}
          onChange={(v) => updateUav({ eoFovMultiplier: v })}
        />
      </div>
      <TopTip type={viewType} />
    </div>
  )
})

CameraView.displayName = 'CameraView'

export default CameraView
