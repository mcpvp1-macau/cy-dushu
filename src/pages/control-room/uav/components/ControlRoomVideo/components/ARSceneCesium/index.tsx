import { Viewer } from 'resium'
import ARSceneConfig from './Config'
// import ARSceneCamera from './CameraNew'
import ARSceneCamera from './Camera'
import ARSenceUpdateData from './UpdateData'
import ARSceneCesiumRender from './Render'
import DeviceOverlaysRender from './Render/DeviceOverlaysRender/DeviceOverlaysRender'

/**纯cesium版的AR */
const ARSceneCesium: FC = () => {
  return (
    <Viewer
      full
      key={'ar-scene-cesium'}
      geocoder={false}
      homeButton={false}
      sceneModePicker={false}
      baseLayerPicker={false}
      navigationHelpButton={false}
      infoBox={false}
      timeline={false}
      fullscreenButton={false}
      selectionIndicator={false}
      navigationInstructionsInitiallyVisible={false}
      vrButton={false}
      shadows={false}
      animation={false}
      requestRenderMode={true}
      skyBox={false}
      // @ts-ignore
      imageryProvider={false}
      contextOptions={{ webgl: { alpha: true } }}
      orderIndependentTranslucency={false}
      scene3DOnly={true}
    >
      <ARSceneConfig />
      <ARSceneCamera />
      <ARSenceUpdateData />

      <ARSceneCesiumRender />
      <DeviceOverlaysRender />
    </Viewer>
  )
}

ARSceneCesium.displayName = 'ARSceneCesium'

export default ARSceneCesium
