import { useCesium } from 'resium'
import useReconstructionMapStore, {
  useReconstructionMapConfigStore,
} from '@/store/map/useReconstructionMap.store'
import CesiumThreeJS3DGS from './cesium-threejs-3dgs'

const ReconstructionDraw: FC = memo(() => {
  const resiumContext = useCesium()
  const layerList = useReconstructionMapStore((s) => s.layerList)
  const [showLayerIds, showGroupIds] = useReconstructionMapConfigStore((s) => [
    s.showLayerIds,
    s.showGroupIds,
  ])

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

    layerList.forEach((layer, i) => {
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

  return <></>
})

ReconstructionDraw.displayName = 'ReconstructionDraw'

export default ReconstructionDraw
