import useAreaWaylineStore from '@/store/wayline/uav-area-wayline/useAreaWayline.store'
import { useCesium } from 'resium'

const useMouseStyle = () => {
  const isDrawHome = useAreaWaylineStore((s) => s.isDrawHome)

  // 是否有起飞点
  const takeOffRefPoint = useAreaWaylineStore(
    (s) => !!s.airlineConfig.takeOffRefPoint,
  )
  // 是否已经绘制了多边形
  const polygon = useAreaWaylineStore((s) => s.templateConfig.polygon)

  const { viewer } = useCesium()

  useEffect(() => {
    if (!viewer) {
      return
    }
    const old = viewer.canvas.style.cursor

    if (isDrawHome) {
      viewer.canvas.style.cursor = `url(/images/airline/takeoff-cur.svg) 15 15, auto`
    } else if (takeOffRefPoint && !polygon?.length) {
      viewer.canvas.style.cursor = `url(/images/airline/draw-polygon.svg) 10 10, auto`
    }

    return () => {
      viewer.canvas.style.cursor = old
    }
  }, [isDrawHome, takeOffRefPoint, polygon])
}

export default useMouseStyle
