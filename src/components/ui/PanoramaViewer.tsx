import 'pannellum'
import 'pannellum/build/pannellum.css'

type PropsType = {
  src: string
}

const PanoramaViewer: FC<PropsType> = memo(({ src }) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) {
      return
    }

    const viewer = pannellum.viewer(containerRef.current, {
      panorama: src,
      autoLoad: true,
      showControls: false,
    })

    return () => {
      viewer.destroy()
    }
  }, [src])

  return <div className="size-full pointer-events-auto" ref={containerRef} />
})

PanoramaViewer.displayName = 'PanoramaViewer'

export default PanoramaViewer
