import { useAsyncEffect } from 'ahooks'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'

const useGroundHeight = (lng: number | null, lat: number | null, level = 11) => {
  const { viewer } = useCesium()

  const [groundHeight, setGroundHeight] = useState(0)

  useAsyncEffect(async () => {
    if (!viewer) {
      return
    }
    const res = await Cesium.sampleTerrain(viewer.terrainProvider, level, [
      Cesium.Cartographic.fromDegrees(lng || 0, lat || 0),
    ])
    const h = res[0]?.height ?? 0
    if (Math.abs(h - groundHeight) > 0.1) {
      setGroundHeight(h)
    }
  }, [lng, lat])

  return groundHeight
}

export default useGroundHeight
