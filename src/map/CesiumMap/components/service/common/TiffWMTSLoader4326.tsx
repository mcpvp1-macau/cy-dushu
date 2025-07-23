import { useCesium } from 'resium'
import * as Cesium from 'cesium'

type PropsType = {
  layer: string
  bboxMinX: number
  bboxMinY: number
  bboxMaxX: number
  bboxMaxY: number
}

const TiffWMTSLoader4326: FC<PropsType> = memo((props) => {
  const { viewer } = useCesium()

  useEffect(() => {
    if (!viewer) {
      return
    }

    const rectangle = Cesium.Rectangle.fromDegrees(
      props.bboxMinX,
      props.bboxMinY,
      props.bboxMaxX,
      props.bboxMaxY,
    )

    // Example: Add a custom imagery layer
    const imageryProvider = new Cesium.UrlTemplateImageryProvider({
      url: `/geoserver/gwc/service/wmts/rest/${props.layer}/ja:ja/EPSG:4326/EPSG:4326:{z}/{y}/{x}?format=image/png`,
      tilingScheme: new Cesium.GeographicTilingScheme(),
      rectangle,
      maximumLevel: 21,
      minimumLevel: 1,
    })

    const imagery = viewer.imageryLayers.addImageryProvider(imageryProvider)

    return () => {
      viewer.imageryLayers.remove(imagery)
    }
  }, [viewer])

  return null
})

TiffWMTSLoader4326.displayName = 'TiffWMTSLoader4326'

export default TiffWMTSLoader4326
