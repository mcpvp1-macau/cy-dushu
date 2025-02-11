import { Viewer } from 'resium'
import ARSceneConfig from './Config'
import ARSceneCamera from './Camera'
import ARSenceUpdateData from './UpdateData'
import ARScenePOIs from './pois'
import type { ContextOptions } from 'cesium'
import QueryData from './QueryData'
import ARSceneCanvas from './canvas'
import ARSceneUavAirline from './airline'

type PropsType = unknown

const Inner: FC = () => {
  return (
    <>
      <ARSceneConfig />
      <ARSceneCamera />
      <ARSenceUpdateData />
      <QueryData />
      <ARSceneUavAirline />
      {/* <ARSceneBanAreas /> */}
      {/* <ARSceneHomePoint /> */}
      {/* <ARScenePointFly /> */}
      {/* <ARSceneUavTracks /> */}
    </>
  )
}

Inner.displayName = 'Inner'

const ARScene: FC<PropsType> = memo(() => {
  const contextOptions = useRef<ContextOptions>({ webgl: { alpha: true } })
  return (
    <div className="absolute top-0 left-0 size-full">
      <ARSceneCanvas />
      <ARScenePOIs />
      <Viewer
        full
        key={'ar-scene'}
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
        contextOptions={contextOptions.current}
        scene3DOnly={true}
      >
        <Inner />
      </Viewer>
    </div>
  )
})

ARScene.displayName = 'ARScene'

export default ARScene
