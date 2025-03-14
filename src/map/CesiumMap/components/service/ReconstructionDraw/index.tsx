import { useCesium } from 'resium'
import { Cartographic, ScreenSpaceEventType } from 'cesium'
import useReconstructionMapStore, {
  useReconstructionMapConfigStore,
} from '@/store/map/useReconstructionMap.store'
import CesiumThreeJS3DGS from './cesium-threejs-3dgs'

const ReconstructionDraw: FC = memo(() => {
  const resiumContext = useCesium()
  console.log('viewer', resiumContext.viewer)
  const layerList = useReconstructionMapStore((s) => s.layerList)
  const hiddenLayerIds = useReconstructionMapConfigStore(
    (s) => s.hiddenLayerIds,
  )

  useEffect(() => {
    if (!resiumContext?.viewer) return

    const viewer = resiumContext.viewer

    const cesiumThreejs3DGS = new CesiumThreeJS3DGS(viewer)
    const renderThreeObj = () => {
      cesiumThreejs3DGS.renderThreeObj()
    }
    viewer.scene.postRender.addEventListener(renderThreeObj)

    const layer = layerList[0]
    cesiumThreejs3DGS.load3dgs({
      splatUrl: 'http://localhost:5173' + layer.modelPath,
      lat: layer.modelLayerLat,
      lon: layer.modelLayerLon,
      height: layer.modelLayerHeight,
      headingPitchRoll: { heading: 0.0, pitch: 0.0, roll: -90 },
      scale: 1,
      camera: {
        offset: { x: 0, y: 0, z: 15 },
        headingPitchRoll: {
          heading: layer.cameraHeading,
          pitch: layer.cameraPitchv,
          roll: layer.cameraRoll,
        },
      },
    })

    return () => {
      viewer.scene.postRender.removeEventListener(renderThreeObj)
      cesiumThreejs3DGS.remove3dgsAll()
    }
  }, [layerList, hiddenLayerIds])

  return <></>
})

ReconstructionDraw.displayName = 'ReconstructionDraw'

export default ReconstructionDraw
