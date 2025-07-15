import { useCesium } from 'resium'

/** 使用 十字 鼠标 */
const useCesiumMouseCrosshair = (open: boolean) => {
  const { viewer } = useCesium()
  useEffect(() => {
    if (!open || !viewer) {
      return
    }
    viewer.canvas.setAttribute('style', 'cursor: crosshair')
    return () => {
      viewer.canvas.setAttribute('style', 'cursor: auto')
    }
  }, [open])
}

export default useCesiumMouseCrosshair
