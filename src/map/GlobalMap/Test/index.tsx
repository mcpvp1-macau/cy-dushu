import { useCesium } from 'resium'
import * as Cesium from 'cesium'

type PropsType = unknown

const Demo: FC<PropsType> = memo(() => {
  const { viewer } = useCesium()

  useEffect(() => {
    if (!viewer) {
      return
    }

    // Example: Add a custom imagery layer
    const imageryProvider = new Cesium.UrlTemplateImageryProvider({
      url: 'http://172.21.30.246:31880/geoserver/gwc/service/wmts?layer=ja%3A01303e0daf5c4a8bb9921ad67075e563&style=&tilematrixset=EPSG%3A4326&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image%2Fpng&TileMatrix=EPSG%3A4326%3A{z}&TileCol={x}&TileRow={y}',
      tilingScheme: new Cesium.GeographicTilingScheme(),
      rectangle: Cesium.Rectangle.fromDegrees(
        119.95982105273713,
        30.275303963123882,
        119.96557717463556,
        30.280379222179846,
      ),
      maximumLevel: 21,
      minimumLevel: 1,
      // baseLayerPicker: false,
    })

    const imagery = viewer.imageryLayers.addImageryProvider(imageryProvider)

    return () => {
      // Cleanup if necessary
      viewer.imageryLayers.remove(imagery)
    }
  }, [viewer])

  return <></>
})

Demo.displayName = 'Demo'

export default Demo
