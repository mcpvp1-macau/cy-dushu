import * as Cesium from 'cesium'
import { attempt } from 'lodash'
import { useCesium } from 'resium'

const usePrimitiveCollection = (index?: number) => {
  const { viewer } = useCesium()
  const [primitiveCollection, setPrimitiveCollection] =
    useState<Cesium.PrimitiveCollection | null>(null)

  useEffect(() => {
    if (!viewer) {
      return
    }

    const primitiveCollection = new Cesium.PrimitiveCollection({})
    viewer.scene.primitives.add(primitiveCollection)
    if (index === 0) {
      viewer.scene.primitives.lowerToBottom(primitiveCollection)
    } else {
      viewer.scene.primitives.raiseToTop(primitiveCollection)
    }
    setPrimitiveCollection(primitiveCollection)
    return () => {
      attempt(() => {
        viewer.scene.primitives.remove(primitiveCollection)
      })
    }
  }, [viewer, index])

  return primitiveCollection
}

export default usePrimitiveCollection
