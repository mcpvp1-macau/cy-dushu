import { memo, type FC } from 'react'
import { useCesium } from 'resium'

type PropsType = unknown

const CesiumDebug: FC<PropsType> = memo(() => {
  const viewer = useCesium()
  useEffect(() => {
    if (!viewer?.scene) {
      return
    }
    viewer.scene.debugShowFramesPerSecond = import.meta.env.DEV
    setTimeout(() => {
      const debugEl = document.querySelector(
        '.cesium-performanceDisplay-defaultContainer',
      ) as HTMLDivElement
      if (debugEl) {
        debugEl!.style.top = '12px'
        debugEl!.style.right = '60px'
      }
    }, 100)
  }, [viewer])

  return null
})

CesiumDebug.displayName = 'CesiumDebug'

export default CesiumDebug
