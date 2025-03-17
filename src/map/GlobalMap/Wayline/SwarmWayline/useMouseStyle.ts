import useSwarmWaylineStore from '@/store/uav/uav-swarm-wayline/useSwarmWayline.store'
import { useCesium } from 'resium'

const useMouseStyle = () => {
  // 是否已经绘制了多边形
  const polygon = useSwarmWaylineStore((s) => s.templateConfig.polygon)

  const { viewer } = useCesium()

  useEffect(() => {
    if (!viewer) {
      return
    }
    const old = viewer.canvas.style.cursor

    if (!polygon?.length) {
      viewer.canvas.style.cursor = `url(/images/airline/draw-polygon.svg) 10 10, auto`
    }

    return () => {
      viewer.canvas.style.cursor = old
    }
  }, [polygon])
}

export default useMouseStyle
