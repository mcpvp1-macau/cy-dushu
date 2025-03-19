import { useCesium } from 'resium'
import useReconstructionMapStore, {
  useReconstructionMapConfigStore,
} from '@/store/map/useReconstructionMap.store'
import CesiumThreeJS3DGS from './cesium-threejs-3dgs'

const ReconstructionDraw: FC = memo(() => {
  const resiumContext = useCesium()
  const layerList = useReconstructionMapStore((s) => s.layerList)
  const [hiddenLayerIds, hiddenGroupIds] = useReconstructionMapConfigStore(
    (s) => [s.hiddenLayerIds, s.hiddenGroupIds],
  )

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
    cesium3dgsRef.current!.hiddenlayerIds = hiddenLayerIds
    cesium3dgsRef.current!.hiddenGroupIds = hiddenGroupIds

    layerList.forEach((layer, i) => {
      // 如果已经添加了或者被隐藏了，则不加载
      if (
        cesium3dgsRef.current!.has(layer.overlayId) ||
        hiddenLayerIds.has(layer.overlayId) ||
        hiddenGroupIds.has(layer.layerId)
      ) {
        return
      }
      cesium3dgsRef.current!.load3dgs({
        layerAttr: layer,
        splatUrl: '/storage' + layer.modelPath,
        lat: layer.modelLayerLat,
        lon: layer.modelLayerLon,
        // 由于第一个测试模型采用激光摄影，高度正常，以后所有的模型都是普通摄像，高度需要减去12
        // height: layer.modelLayerHeight - 12,
        height: layer.modelLayerHeight - 12 * i,
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
  }, [layerList, hiddenLayerIds, hiddenGroupIds])

  return <></>
})

ReconstructionDraw.displayName = 'ReconstructionDraw'

export default ReconstructionDraw
