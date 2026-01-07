import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import FloatIconButton from '@/components/ui/button/FloatIconButton'
import { attempt } from 'lodash'

const Compass: FC = memo(() => {
  const { viewer } = useCesium()
  const { t } = useTranslation()

  const [headingDeg, setHeadingDeg] = useState(0)
  const headingRef = useRef(0)
  const percentageChangedRef = useRef<number | null>(null)

  const updateHeading = useMemoizedFn(() => {
    const heading = viewer?.camera?.heading
    if (heading === undefined || heading === null || Number.isNaN(heading)) {
      return
    }

    const normalized = Cesium.Math.zeroToTwoPi(heading)
    const nextDeg = Cesium.Math.toDegrees(normalized)
    const diff = Math.abs(nextDeg - headingRef.current)
    const wrappedDiff = Math.min(diff, 360 - diff)
    if (wrappedDiff < 0.1) {
      return
    }

    headingRef.current = nextDeg
    setHeadingDeg(nextDeg)
  })

  useEffect(() => {
    if (!viewer?.camera) {
      return
    }

    if (percentageChangedRef.current === null) {
      percentageChangedRef.current = viewer.camera.percentageChanged
    }
    viewer.camera.percentageChanged = 0.05

    updateHeading()
    const handleChange = () => updateHeading()
    viewer.camera.changed.addEventListener(handleChange)
    return () => {
      attempt(() => {
        viewer.camera.changed.removeEventListener(handleChange)
        if (percentageChangedRef.current !== null) {
          viewer.camera.percentageChanged = percentageChangedRef.current
        }
      })
    }
  }, [updateHeading, viewer])

  const handleResetNorth = useMemoizedFn(() => {
    if (!viewer?.camera) {
      return
    }

    const destination = viewer.camera.positionWC ?? viewer.camera.position
    if (!destination) {
      return
    }

    viewer.camera.flyTo({
      destination,
      orientation: {
        heading: 0,
        pitch: viewer.camera.pitch ?? 0,
        roll: viewer.camera.roll ?? 0,
      },
      duration: 0.4,
      easingFunction: Cesium.EasingFunction.QUADRATIC_OUT,
    })
  })

  const rotationStyle = useMemo(
    () => ({
      transform: `rotate(${-headingDeg}deg)`,
    }),
    [headingDeg],
  )

  const resetLabel = t('map.compass.reset', { defaultValue: 'Reset to north' })
  const northLabel = 'N'

  return (
    <FloatIconButton
      className="size-8 rounded-full border border-solid border-ground-4/70 shadow-md translate-x-[2px]"
      tippyProps={{
        content: resetLabel,
        placement: 'left',
      }}
      onClick={handleResetNorth}
      aria-label={resetLabel}
    >
      <div className="absolute inset-0">
        <div className="absolute inset-[6px] rounded-full border border-ground-4/50" />
        <div
          className="absolute inset-0 flex items-center justify-center transition-transform duration-150"
          style={rotationStyle}
        >
          <svg viewBox="0 0 100 100" className="size-8 text-fore">
            <polygon
              points="50,10 62,50 50,44 38,50"
              className="fill-current text-primary"
            />
            <polygon
              points="50,90 62,50 50,56 38,50"
              className="fill-current text-fore/40"
            />
            <text
              x="50"
              y="16"
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-current text-fore text-[20px] font-semibold"
            >
              {northLabel}
            </text>
          </svg>
        </div>
      </div>
    </FloatIconButton>
  )
})

Compass.displayName = 'Compass'

export default Compass
