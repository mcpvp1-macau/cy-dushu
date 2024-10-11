import CameraControl from './components/Controller'
import { Button } from 'antd'
import TopTip from './components/TopTip'
import NarrowRect from './components/NarrowRect'
import DistanceMeasure from './components/DistanceMeasure'
import { limitNum } from '@/utils/math'
import useAirlineConfigStore from '@/store/uav/uav-airline/useAirlineConfig.store'
import CesiumMap from '@/map/CesiumMap'
import ZoomSlider from '@/components/device/ZoomSlider'

type PropsType = unknown

/** 摄像头视图地图 */
const CameraView: FC<PropsType> = memo(() => {
  const cameraInfo = useAirlineConfigStore((s) => s.cameraInfo)
  const fovMultipiler = useAirlineConfigStore((s) => s.uav.eoFovMultiplier)
  const updateUav = useAirlineConfigStore((s) => s.updateUav)
  const [viewType, setViewType] = useState<'wide' | 'narrow'>('narrow')

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
      }}
      onWheel={handleWheel}
    >
      <CesiumMap id="airline-edit-camera-view-map">
        <CameraControl viewType={viewType} />
        {viewType === 'wide' && <NarrowRect />}
        <DistanceMeasure />
      </CesiumMap>
      {/* <DirtyCesiumMap>
            <CameraControl viewType={viewType} />
            {viewType === 'wide' && <NarrowRect />}
            <DistanceMeasure />
          </DirtyCesiumMap> */}
      {/* 模式切换按钮 */}
      <Button
        className="absolute left-3 top-1/2"
        style={{ transform: 'translateY(-50%)' }}
        onClick={() => setViewType((t) => (t === 'narrow' ? 'wide' : 'narrow'))}
      >
        {viewType === 'narrow' ? '广角[1]' : `变焦[2]`}
      </Button>
      {/* 焦距滑块 */}
      <div
        className="absolute right-0 top-0 bottom-0 w-[70px]"
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
