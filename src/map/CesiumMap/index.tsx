import { Viewer } from 'resium'
import { memo, ReactNode, type FC } from 'react'
import * as Cesium from 'cesium'
import DefaultImageryLayer from './components/DefaultImageryLayer'
import CesiumDefaultConfig from './components/CesiumDefaultConfig'
import MapLayerConfig from '../LayerConfig/LayerConfig'

type PropsType = {
  id: string
  children?: ReactNode
}

Cesium.Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_ACCESS_TOKEN

const CesiumMap: FC<PropsType> = memo(({ id, children }) => {
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
      // sceneMode={Cesium.SceneMode.SCENE2D}
      animation={false}
      // requestRenderMode={true}
      skyBox={false}
      // @ts-ignore
      imageryProvider={false}
    >
      <DefaultImageryLayer />
      <CesiumDefaultConfig />
      {children}
      <div className="absolute right-3 bottom-3">
        <MapLayerConfig />
      </div>
    </Viewer>
  )
})

CesiumMap.displayName = 'CesiumMap'

export default CesiumMap
