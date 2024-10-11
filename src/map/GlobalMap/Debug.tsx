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
  }, [viewer])

  return null
})

CesiumDebug.displayName = 'CesiumDebug'

export default CesiumDebug
