import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import { MartiniTerrainProvider } from '@zjugis/cesium-martini'

/**
 * 自定义全球地形
 * 加载mapbox的rgb全球地形
 * @returns
 */
const CustomCesiumGlobalTerrain = () => {
  const { viewer } = useCesium()
  useEffect(() => {
    const url = `/data/maptiler-terrain-rgb/{z}/{x}/{y}.png`

    const terrainLayer = new MartiniTerrainProvider({
      url: new Cesium.Resource({
        url: url,
      }),
      requestVertexNormals: true,
      minZoomLevel: 5,
    })
    terrainLayer.getTileDataAvailable = (x: number, y: number, z: number) => {
      if (z > 11) {
        return false
      }
      return true
    }
    if (viewer)
      // 设置 Cesium Viewer 或 Scene 的 terrainProvider 属性
      // viewer.terrainProvider = terrainLayer


      return () => {
        //
      }
  }, [])
  return null
}

export default CustomCesiumGlobalTerrain
