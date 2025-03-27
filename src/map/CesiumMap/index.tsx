import { Scene, Viewer } from 'resium'
import { lazy, memo, ReactNode, Suspense, type FC } from 'react'
import * as Cesium from 'cesium'
import DefaultImageryLayer from './components/DefaultImageryLayer'
import CesiumDefaultConfig from './components/CesiumDefaultConfig'
import MapLayerConfig from '../LayerConfig/LayerConfig'
import CustomImageryLayer from './components/CustomImageryLayer'
import FloatIconButton from '@/components/ui/button/FloatIconButton'
import CustomCesiumGlobalTerrain from './components/CustomCesiumGlobalTerrain'
import useMapSettingStore from '@/store/setting/useMapSetting.store'
import IconLoading from '@/assets/icons/jsx/IconLoading'
import BottomBar from './components/BottomBar'
const ShanghaiBanAreas = lazy(
  () => import('./components/custom/ShanghaiBanAreas'),
)
const ShanghaiBanRoutes = lazy(
  () => import('./components/custom/ShanghaiBanRoutes'),
)

type PropsType = {
  id: string
  children?: ReactNode
  useToolBar?: boolean
}

Cesium.Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_ACCESS_TOKEN

const CesiumMap: FC<PropsType> = memo(({ id, useToolBar = true, children }) => {
  const [is2D, { toggle }] = useBoolean(false)

  const webgl1 = useMapSettingStore((s) => s.webgl1)
  const contextOptions = useMemo<Cesium.ContextOptions>(
    () => ({
      requestWebgl1: webgl1,
    }),
    [webgl1],
  )

  return (
    <Viewer
      key={webgl1 ? 'webgl1' : 'webgl2'}
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
      requestRenderMode={true}
      skyBox={false}
      // @ts-ignore
      imageryProvider={false}
      contextOptions={contextOptions}
    >
      <Scene
        mode={is2D ? Cesium.SceneMode.SCENE2D : Cesium.SceneMode.SCENE3D}
        morphDuration={0}
      />
      <DefaultImageryLayer />
      <CustomImageryLayer />
      <CesiumDefaultConfig />
      <CustomCesiumGlobalTerrain />
      <Suspense
        fallback={
          <div className="absolute inset-0 bg-ground-1/20 backdrop-blur-sm flex justify-center items-center">
            <IconLoading className="text-white text-3xl scale-150" />
          </div>
        }
      >
        {children}
      </Suspense>
      {useToolBar && (
        <div className="absolute right-3 bottom-8 flex flex-col gap-3">
          <FloatIconButton onClick={toggle}>
            {is2D ? '2D' : '3D'}
          </FloatIconButton>
          <MapLayerConfig />
        </div>
      )}
      <Suspense fallback={null}>
        {globalConfig.useShanghaiBanRoutes && (
          <>
            <ShanghaiBanRoutes />
            <ShanghaiBanAreas />
          </>
        )}
      </Suspense>
      <BottomBar />
    </Viewer>
  )
})

CesiumMap.displayName = 'CesiumMap'

export default CesiumMap
