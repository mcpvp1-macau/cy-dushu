import { Viewer } from 'resium'
import ARSceneConfig from './Config'
import ARSceneCamera from './Camera'
import ARSenceUpdateData from './UpdateData'
import ARSceneRoads from './roads/Roads'
import ARSceneAOIs from './aois'
import ARScenePOIs from './pois'
import ARSceneBanAreas from './ban-fly-area'
import ARSceneUavAirline from './airline'
import ARSceneHomePoint from './HomePoint'
import ARScenePointFly from './PointFly'
import ARSceneUavTracks from './RealTrack'

type PropsType = unknown

const ARScene: FC<PropsType> = memo(() => {
  return (
    <Viewer
      full
      id="ar-scene"
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
      // skyBox={false}
      shadows={false}
      animation={false}
      requestRenderMode={true}
      skyBox={false}
      // @ts-ignore
      imageryProvider={false}
      contextOptions={{ webgl: { alpha: true } }}
      scene3DOnly={true}
    >
      <ARSceneConfig />
      <ARSceneCamera />
      <ARSenceUpdateData />
      <ARSceneRoads />
      <ARSceneAOIs />
      <ARScenePOIs />
      <ARSceneUavAirline />
      <ARSceneBanAreas />
      <ARSceneHomePoint />
      <ARScenePointFly />
      <ARSceneUavTracks />
      {/* <LayerOverlaies /> */}
    </Viewer>
  )
})

ARScene.displayName = 'ARScene'

export default ARScene
