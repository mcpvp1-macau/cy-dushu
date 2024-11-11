import { Scene, Viewer } from 'resium'
import { memo, ReactNode, type FC } from 'react'
import * as Cesium from 'cesium'
import DefaultImageryLayer from './components/DefaultImageryLayer'
import CesiumDefaultConfig from './components/CesiumDefaultConfig'
import MapLayerConfig from '../LayerConfig/LayerConfig'
import CustomImageryLayer from './components/CustomImageryLayer'
import FloatIconButton from '@/components/ui/button/FloatIconButton'

type PropsType = {
  id: string
  children?: ReactNode
}

Cesium.Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_ACCESS_TOKEN

const CesiumMap: FC<PropsType> = memo(({ id, children }) => {
  const [is2D, { toggle }] = useBoolean(false)

  return (
    <Viewer
      full
      id={id}
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
      // requestRenderMode={true}
      skyBox={false}
      // @ts-ignore
      imageryProvider={false}
    >
      <Scene
        mode={is2D ? Cesium.SceneMode.SCENE2D : Cesium.SceneMode.SCENE3D}
        morphDuration={0}
      />
      <DefaultImageryLayer />
      <CustomImageryLayer />
      <CesiumDefaultConfig />
      {children}
      <div className="absolute right-3 bottom-3 flex flex-col gap-3">
        <FloatIconButton onClick={toggle}>{is2D ? '2D' : '3D'}</FloatIconButton>
        <MapLayerConfig />
      </div>
    </Viewer>
  )
})

CesiumMap.displayName = 'CesiumMap'

export default CesiumMap
