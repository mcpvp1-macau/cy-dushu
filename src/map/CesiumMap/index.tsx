import { Scene, Viewer } from 'resium'
import { lazy, memo, ReactNode, Suspense, type FC } from 'react'
import * as Cesium from 'cesium'
import DefaultImageryLayer from './components/DefaultImageryLayer'
import CesiumDefaultConfig from './components/CesiumDefaultConfig'
import CustomImageryLayer from './components/CustomImageryLayer'
import FloatIconButton from '@/components/ui/button/FloatIconButton'
import CustomCesiumGlobalTerrain from './components/CustomCesiumGlobalTerrain'
import useMapSettingStore from '@/store/setting/useMapSetting.store'
import IconLoading from '@/assets/icons/jsx/IconLoading'
import BottomBar from './components/BottomBar'
import FuzhouJiefangBridge from './components/custom/FuzhouJiefangBridge'
import ErrorListener from './components/ErrorListener'
import { Button } from 'antd'
import MapSpace from '../LayerConfig/components/MapSpace/MapSpace'
import LayerOverlay from '../LayerConfig/components/LayerOverlay/LayerOverlay'
import Reconstruction3D from '../LayerConfig/components/Reconstruction3D/Reconstruction3D'
import FlightAreaConfig from '../LayerConfig/components/FlightArea/FlightArea'
import FloatIconButtonGroup from '@/components/ui/button/FloatIconButton/FloatIconButtonGroup'
import Reconstruction2D from '../LayerConfig/components/Reconstruction2D/Reconstruction2D'

const HangzhouBanAreas = lazy(
  () => import('./components/custom/HangzhouBanAreas'),
)

const GuizhouProjects = lazy(
  () => import('./components/custom/GuizhouProjects'),
)

const ShanghaiWarZoneConfig = lazy(
  () => import('./components/custom/ShanghaiWarZoneConfig'),
)

const ShanghaiBanAreas = lazy(
  () => import('./components/custom/ShanghaiBanAreas'),
)
const ShanghaiBanRoutes = lazy(
  () => import('./components/custom/ShanghaiBanRoutes'),
)
const ShanghaiWarZone = lazy(
  () => import('./components/custom/ShanghaiWarZone'),
)

const GuizhouFarm = lazy(() => import('./components/custom/GuizhouFarm'))

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

  const [errorPanelOpen, setErrorPanelOpen] = useState(false)

  const [retryKey, setRetryKey] = useState(0)

  return (
    <Viewer
      key={`${webgl1 ? 'webgl1' : 'webgl2'}-${retryKey}`}
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
      <ErrorListener onRenderError={() => setErrorPanelOpen(true)} />
      <DefaultImageryLayer />
      <CustomImageryLayer />
      <CesiumDefaultConfig />
      {globalConfig.useTerrain && <CustomCesiumGlobalTerrain />}
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
        <div className="absolute right-3 bottom-8 flex flex-col gap-3 z-10">
          <FloatIconButtonGroup mode="vertical">
            <MapSpace />
            <LayerOverlay />
            <FlightAreaConfig />
            <Reconstruction3D />
            <Reconstruction2D />
          </FloatIconButtonGroup>
          {globalConfig.useShanghaiBanRoutes && <ShanghaiWarZoneConfig />}
          <FloatIconButton onClick={toggle}>
            {is2D ? '2D' : '3D'}
          </FloatIconButton>
        </div>
      )}
      <Suspense fallback={null}>
        {globalConfig.useShanghaiBanRoutes && (
          <>
            <ShanghaiWarZone />
            <ShanghaiBanRoutes />
            <ShanghaiBanAreas />
          </>
        )}
        {globalConfig.useGuizhouFarm && <GuizhouFarm />}
        {globalConfig.useHangzhouBanAreas && <HangzhouBanAreas />}
        {globalConfig.useGuizhouProjects && <GuizhouProjects />}
      </Suspense>
      <BottomBar />
      <FuzhouJiefangBridge />
      {errorPanelOpen && (
        <div className="absolute inset-0 z-10 bg-black/50 backdrop-blur flex justify-center items-center">
          <div className="flex flex-col gap-3 items-center">
            <div className="text-lg">Something error</div>
            <Button
              type="primary"
              onClick={() => {
                setRetryKey((prev) => prev + 1)
                setErrorPanelOpen(false)
              }}
            >
              重试
            </Button>
          </div>
        </div>
      )}
    </Viewer>
  )
})

CesiumMap.displayName = 'CesiumMap'

export default CesiumMap
