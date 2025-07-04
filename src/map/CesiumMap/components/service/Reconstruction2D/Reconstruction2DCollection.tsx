import { CameraVertexPicker } from '@/utils/cesium/camera/camera-vertex-pick'
import { createContext } from 'react'
import { useCesium } from 'resium'

type PropsType = {
  children?: React.ReactNode
}

export const VertexPickerContext = createContext<CameraVertexPicker | null>(
  null,
)

const Reconstruction2DCollection: FC<PropsType> = memo(({ children }) => {
  const { viewer } = useCesium()

  const picker = useMemo(() => {
    if (!viewer) {
      return null
    }

    return new CameraVertexPicker(viewer)
  }, [viewer])

  return (
    <VertexPickerContext.Provider value={picker}>
      {children}
    </VertexPickerContext.Provider>
  )
})

Reconstruction2DCollection.displayName = 'Reconstruction2DCollection'

export default Reconstruction2DCollection
