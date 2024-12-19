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
import useSettingStore from '@/store/useSetting.store'
import type { ContextOptions } from 'cesium'

type PropsType = unknown

const Inner: FC = () => {
  const roadEnable = useSettingStore((s) => s.virtualReal.mainRoad.enable)
  const aoiEnable = useSettingStore((s) => s.virtualReal.building.enable)
  const textEnable = useSettingStore((s) => s.virtualReal.text.enable)

  return (
    <>
      <ARSceneConfig />
      <ARSceneCamera />
      <ARSenceUpdateData />
      {roadEnable && <ARSceneRoads />}
      {aoiEnable && <ARSceneAOIs />}
      {textEnable && <ARScenePOIs />}
      <ARSceneUavAirline />
      <ARSceneBanAreas />
      <ARSceneHomePoint />
      <ARScenePointFly />
      <ARSceneUavTracks />
    </>
  )
}

Inner.displayName = 'Inner'

const ARScene: FC<PropsType> = memo(() => {
  const contextOptions = useRef<ContextOptions>({ webgl: { alpha: true } })
  return (
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
  )
})

ARScene.displayName = 'ARScene'

export default ARScene
