import { useCesium } from 'resium'
import { VertexPickerContext } from './Reconstruction2DCollection'
import * as Cesium from 'cesium'
import { ProcessedResultType } from '@/store/map/useReconstruction2DMap.store'
import { handleStorageURL } from '@/pages/events/components/EventDetail'

type dataType = {
  data: ProcessedResultType
}

const Reconstruction2DItem: FC<dataType> = memo(({ data }) => {
  const picker = useContext(VertexPickerContext)
  const { viewer } = useCesium()

  useEffect(() => {
    if (!picker || !viewer) {
      return
    }

    const vertex = picker.getGimbalPick(
      {
        lon: data.lon,
        lat: data.lat,
        alt: data.alt,
      },
      { yaw: data.yaw, pitch: data.pitch, roll: data.roll },
      data.focal,
      data.width,
      data.aspectRatio,
      data.zoomFactor,
    )

    if (
      !vertex.leftBottom ||
      !vertex.rightTop ||
      !vertex.rightBottom ||
      !vertex.leftTop
    ) {
      return
    }

    // 创建图片材质
    const imageMaterial = new Cesium.Material({
      fabric: {
        type: 'Image',
        uniforms: {
          image: handleStorageURL(data.imgUrl), // 替换为你的图片路径
        },
      },
    })

    const primitive = new Cesium.GroundPrimitive({
      geometryInstances: new Cesium.GeometryInstance({
        geometry: new Cesium.PolygonGeometry({
          polygonHierarchy: new Cesium.PolygonHierarchy(
            Cesium.Cartesian3.fromDegreesArray([
              vertex.leftBottom[0],
              vertex.leftBottom[1],
              vertex.leftTop[0],
              vertex.leftTop[1],
              vertex.rightTop[0],
              vertex.rightTop[1],
              vertex.rightBottom[0],
              vertex.rightBottom[1],
            ]),
          ),
          vertexFormat: Cesium.VertexFormat.POSITION_AND_ST,
          stRotation: Cesium.Math.toRadians(data.yaw),
          perPositionHeight: true,
        }),
      }),
      // 使用图片作为纹理
      appearance: new Cesium.MaterialAppearance({
        material: imageMaterial,
        flat: true, // 如果不需要光照效果，设置为 true
      }),
      asynchronous: false,
    })

    viewer.scene.primitives.add(primitive)

    return () => {
      if (viewer?.scene?.primitives) {
        viewer.scene.primitives.remove(primitive)
      }
    }
  }, [picker, data])

  return null
})

Reconstruction2DItem.displayName = 'Reconstruction2DItem'

export default Reconstruction2DItem
