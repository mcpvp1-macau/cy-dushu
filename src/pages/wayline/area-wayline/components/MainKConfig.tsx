import XCard from '@/components/ui/XCard'
import HSlider from '../../edit/components/HSlider'
import { useGlobalCesium } from '@/store/map/useGlobalMap.store'
import useAreaWaylineStore from '@/store/uav/uav-area-wayline/useAreaWayline.store'
import * as turf from '@turf/turf'
import { getWindowPostion } from '@/utils/cesium/position-screen'
import { createPortal } from 'react-dom'
import { useDebounceFn } from 'ahooks'
import * as Cesium from 'cesium'
import { limitNum } from '@/utils/math'
import { InfoCircleOutlined } from '@ant-design/icons'
import { Tooltip } from 'antd'

type PropsType = unknown

const MainKConfig: FC<PropsType> = memo(() => {
  const { t } = useTranslation()
  const [kValue, setKValue] = useState(0)
  const mainK = useAreaWaylineStore((s) => s.templateConfig.mainK)

  useEffect(() => {
    const deg = Math.round(Math.atan(mainK) * (180 / Math.PI)) % 180

    if (deg !== kValue && kValue - deg !== 180) {
      setKValue(deg)
    }
  }, [mainK])

  const updateTemplateConfig = useAreaWaylineStore(
    (s) => s.updateTemplateConfig,
  )
  const polygon = useAreaWaylineStore((s) => s.templateConfig.polygon)
  const viewer = useGlobalCesium()

  const centerPoint = useMemo(() => {
    if (!polygon || polygon.length < 3) {
      return
    }

    const plg = [...polygon]
    if (
      plg[0][0] !== plg[plg.length - 1][0] ||
      plg[0][1] !== plg[plg.length - 1][1]
    ) {
      plg.push(plg[0])
    }

    const center = turf.center(turf.polygon([plg]))
    return center?.geometry.coordinates
  }, [polygon])

  const [windowPosition, setWindowPosition] = useState<{
    x: number
    y: number
  } | null>(null)
  const [cameeraHeading, setCameraHeading] = useState<number | null>(null)

  const { run: clear } = useDebounceFn(
    () => {
      setWindowPosition(null)
      setCameraHeading(null)
      updateTemplateConfig({
        mainK: Math.tan(((kValue === 90 ? 90.000001 : kValue) * Math.PI) / 180),
      })
    },
    { wait: 1_000 },
  )

  const handleChange = (v: number) => {
    setKValue(v)
    if (!windowPosition) {
      if (viewer && centerPoint) {
        const c = getWindowPostion(viewer, centerPoint)
        setWindowPosition(c)
      } else if (viewer) {
        const rect = viewer.canvas.getBoundingClientRect()
        setWindowPosition({
          x: rect.left + (rect.width >> 1),
          y: rect.top + (rect.height >> 1),
        })
      }
    }
    if (viewer && cameeraHeading === null) {
      setCameraHeading(Cesium.Math.toDegrees(viewer.camera.heading))
    }
    clear()
  }

  return (
    <XCard
      title={
        <div className="flex items-center gap-1">
          {t('wayline.waylineConfig.mainAxisDirection.title')}
          <Tooltip
            className="ml-1"
            title={t('wayline.waylineConfig.mainAxisDirection.tooltip')}
          >
            <InfoCircleOutlined />
          </Tooltip>
        </div>
      }
      topRight={<span className="text-primary text-sm">{kValue}°</span>}
    >
      <HSlider
        className="mt-3"
        value={kValue}
        max={180}
        min={-180}
        step={1}
        onChange={handleChange}
      />
      {windowPosition &&
        createPortal(
          <div
            className="fixed z-10 -translate-x-1/2 -translate-y-1/2 bg-ground-1 bg-opacity-60 w-32 h-32 rounded-full"
            style={{
              left: limitNum(
                windowPosition.x,
                200,
                document.body.clientWidth - 200,
              ),
              top: limitNum(
                windowPosition.y,
                120,
                document.body.clientHeight - 120,
              ),
            }}
          >
            <div className="abs-center">
              <div
                className="w-24 h-1 rounded origin-center bg-white "
                style={{ rotate: `${-kValue - (cameeraHeading ?? 0)}deg` }}
              />
            </div>
          </div>,
          document.body,
        )}
    </XCard>
  )
})

MainKConfig.displayName = 'MainKConfig'

export default MainKConfig
