import { useCesium } from 'resium'
import CesiumThreeJS3DGS from './cesium-threejs-3dgs'
import * as Cesium from 'cesium'

type PropsType = {
  layerList: API_RECONSTRUCTION.Layer[]
  showLayerIds: Set<number>
}

const ReconstructionDraw: FC<PropsType> = memo(
  ({ layerList, showLayerIds }) => {
    const resiumContext = useCesium()

    const cesium3dgsRef = useRef<CesiumThreeJS3DGS | null>(null)

    useEffect(() => {
      const viewer = resiumContext.viewer!
      cesium3dgsRef.current = new CesiumThreeJS3DGS(viewer)

      const renderThreeObj = () => {
        if (cesium3dgsRef.current) {
          cesium3dgsRef.current.renderThreeObj()
        }
      }
      viewer.scene.postRender.addEventListener(renderThreeObj)

      return () => {
        viewer.scene.postRender.removeEventListener(renderThreeObj)
        cesium3dgsRef.current?.remove3dgsAll()
        cesium3dgsRef.current?.dispose()
      }
    }, [])

    useEffect(() => {
      if (!cesium3dgsRef.current) return

      const viewer = resiumContext.viewer!

      const preShowLayerIds = cesium3dgsRef.current!.showLayerIds
      // 之前未显示，现在开启显示，就跳转到模型位置
      if (layerList) {
        layerList.forEach((layer) => {
          let preShow = 0
          let curShow = 0

          if (preShowLayerIds.has(layer.overlayId)) {
            preShow = 1
          }
          if (showLayerIds.has(layer.overlayId)) {
            curShow = 1
          }

          if (curShow > preShow) {
            const llh = [
              layer.modelLayerLon,
              layer.modelLayerLat,
              layer.modelLayerHeight + 1000,
            ] as const

            const distance = Cesium.Cartesian3.distance(
              viewer.camera.position,
              Cesium.Cartesian3.fromDegrees(...llh),
            )
            // 暂定相机离模型1000米外再跳转
            if (distance > 1000) {
              viewer.camera.flyTo({
                destination: Cesium.Cartesian3.fromDegrees(...llh),
                duration: 1,
              })
            }
            return
          }
        })
      }

      cesium3dgsRef.current!.showLayerIds = new Set(showLayerIds)

      layerList.forEach((layer) => {
        // 如果已经添加了或者被隐藏了，则不加载
        if (
          cesium3dgsRef.current!.has(layer.overlayId) ||
          !showLayerIds.has(layer.overlayId)
        ) {
          return
        }
        cesium3dgsRef.current!.load3dgs({
          layerAttr: layer,
          splatUrl: '/storage' + layer.modelPath,
          lat: layer.modelLayerLat,
          lon: layer.modelLayerLon,
          height: layer.modelLayerHeight - 7,
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
    }, [layerList, showLayerIds])

    return null
  },
)

ReconstructionDraw.displayName = 'ReconstructionDraw'

export default ReconstructionDraw
