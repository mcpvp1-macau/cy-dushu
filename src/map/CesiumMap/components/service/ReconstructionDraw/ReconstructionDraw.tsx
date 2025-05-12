import { useCesium } from 'resium'
import CesiumThreeJS3DGS from './cesium-threejs-3dgs'

type PropsType = {
  layerList: API_RECONSTRUCTION.Layer[]
  showLayerIds: Set<number>
  showGroupIds: Set<number>
}

const ReconstructionDraw: FC<PropsType> = memo(
  ({ layerList, showLayerIds, showGroupIds }) => {
    const resiumContext = useCesium()

    const cesium3dgsRef = useRef<CesiumThreeJS3DGS | null>(null)

    useEffect(() => {
      const viewer = resiumContext.viewer!
      cesium3dgsRef.current = new CesiumThreeJS3DGS(viewer)

      const renderThreeObj = () => {
        cesium3dgsRef.current && cesium3dgsRef.current.renderThreeObj()
      }
      viewer.scene.postRender.addEventListener(renderThreeObj)

      return () => {
        viewer.scene.postRender.removeEventListener(renderThreeObj)
        cesium3dgsRef.current?.remove3dgsAll()
        cesium3dgsRef.current?.dispose()
      }
    }, [])

    useEffect(() => {
      cesium3dgsRef.current!.showLayerIds = showLayerIds
      cesium3dgsRef.current!.showGroupIds = showGroupIds

      layerList.forEach((layer) => {
        // 如果已经添加了或者被隐藏了，则不加载
        if (
          cesium3dgsRef.current!.has(layer.overlayId) ||
          !showLayerIds.has(layer.overlayId) ||
          !showGroupIds.has(layer.layerId)
        ) {
          return
        }
        cesium3dgsRef.current!.load3dgs({
          layerAttr: layer,
          splatUrl: '/storage' + layer.modelPath,
          lat: layer.modelLayerLat,
          lon: layer.modelLayerLon,
          height: layer.modelLayerHeight - 12,
          headingPitchRoll: { heading: 0.0, pitch: 0.0, roll: -90 },
          scale: 1,
          camera: {
            offset: { x: 0, y: 0, z: 15 },
            headingPitchRoll: {
              heading: layer.cameraHeading,
              pitch: layer.cameraPitch,
              roll: layer.cameraRoll,
            },
          },
        })
      })

      return () => {}
    }, [layerList, showLayerIds, showGroupIds])

    return null
  },
)

ReconstructionDraw.displayName = 'ReconstructionDraw'

export default ReconstructionDraw
