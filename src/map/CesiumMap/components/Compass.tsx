import { useCesium } from 'resium'
import { twMerge } from 'tailwind-merge'

const Compass: FC<{ className?: string }> = memo(({ className }) => {
  const { viewer } = useCesium()
  const { t } = useTranslation()
  const [heading, setHeading] = useState(0)

  const updateHeading = useMemoizedFn(() => {
    if (!viewer) {
      return
    }

    setHeading(viewer.camera?.heading ?? 0)
  })

  useEffect(() => {
    if (!viewer) {
      return
    }

    updateHeading()

    viewer.camera.changed.addEventListener(updateHeading)

    return () => {
      viewer.camera.changed.removeEventListener(updateHeading)
    }
  }, [updateHeading, viewer])

  const handleResetNorth = useMemoizedFn(() => {
    if (!viewer) {
      return
    }

    const camera = viewer.camera
    const destination = camera.positionWC?.clone?.() ?? camera.position?.clone?.()

    camera.setView({
      destination,
      orientation: {
        heading: 0,
        pitch: camera.pitch,
        roll: camera.roll,
      },
    })
    viewer.scene?.requestRender?.()
  })

  return (
    <button
      type="button"
      className={twMerge(
        'relative w-12 h-12 rounded-full border border-ground-4 bg-ground-1/90 backdrop-blur-sm shadow-lg flex items-center justify-center overflow-hidden transition hover:bg-ground-2',
        className,
      )}
      onClick={handleResetNorth}
      title={t('map.compass.reset', { defaultValue: '重置朝北' })}
      aria-label={t('map.compass.reset', { defaultValue: '重置朝北' })}
    >
      <div className="absolute inset-[6px] rounded-full border border-ground-4" />
      <div
        className="relative w-8 h-8"
        style={{ transform: `rotate(${-heading}rad)` }}
      >
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-b-[12px] border-b-brand-6" />
        <div className="absolute left-1/2 bottom-0 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[12px] border-t-ground-4/70" />
      </div>
    </button>
  )
})

Compass.displayName = 'Compass'

export default Compass
