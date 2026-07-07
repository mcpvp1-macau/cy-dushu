import { memo, type FC } from 'react'
import { useCesium } from 'resium'

type PropsType = unknown

const CesiumDebug: FC<PropsType> = memo(() => {
  const viewer = useCesium()
  useEffect(() => {
    if (!viewer?.scene) {
      return
    }
    // 演示环境不展示 FPS 调试面板
    viewer.scene.debugShowFramesPerSecond = false
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
