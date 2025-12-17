import { Scene, Viewer } from 'resium'
import {
  Component,
  lazy,
  memo,
  ReactNode,
  Suspense,
  type FC,
  type ErrorInfo,
} from 'react'
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
import { useTranslation } from 'react-i18next'

const HangzhouBanAreas = lazy(
  () => import('./components/custom/HangzhouBanAreas'),
)

const GuizhouProjects = lazy(
  () => import('./components/custom/GuizhouProjects'),
)

const ShanghaiWarZoneConfig = lazy(
  () => import('./components/custom/ShanghaiWarZoneConfig'),
)

const ShanghaiBanRoutes = lazy(
  () => import('./components/custom/ShanghaiBanRoutes'),
)
const ShanghaiWarZone = lazy(
  () => import('./components/custom/ShanghaiWarZone'),
)

const BinzhouDemo = lazy(() => import('./components/BinzhouDemo'))

const GuizhouFarm = lazy(() => import('./components/custom/GuizhouFarm'))

const XiaoshanXZZone = lazy(() => import('./components/custom/XiaoshanXZZone'))

const XiaoshanXZZoneConfig = lazy(
  () => import('./components/custom/XiaoshanXZZoneConfig'),
)

type PropsType = {
  id: string
  children?: ReactNode
  useToolBar?: boolean
}

type ErrorBoundaryProps = {
  resetKey?: number
  onError?: (error: unknown) => void
  children: ReactNode
}

type ErrorBoundaryState = {
  hasError: boolean
}

class CesiumRenderErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)

    this.state = {
      hasError: false,
    }
  }

  static getDerivedStateFromError() {
    return {
      hasError: true,
    }
  }

  componentDidCatch(error: unknown, errorInfo: ErrorInfo) {
    console.error('Cesium render error boundary caught error', error, errorInfo)
    this.props.onError?.(error)
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({
        hasError: false,
      })
    }
  }

  render() {
    if (this.state.hasError) {
      return null
    }

    return this.props.children
  }
}

Cesium.Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_ACCESS_TOKEN

const CesiumMap: FC<PropsType> = memo(({ id, useToolBar = true, children }) => {
  const { t } = useTranslation()
  const [is2D, { toggle }] = useBoolean(false)

  const webgl1 = useMapSettingStore((s) => s.webgl1)
  const contextOptions = useMemo<Cesium.ContextOptions>(
    () => ({
      requestWebgl1: webgl1,
    }),
    [webgl1],
  )

  const [renderError, setRenderError] = useState<unknown>()
  const [retryKey, setRetryKey] = useState(0)

  const errorDetail = useMemo(() => {
    if (!renderError) {
      return ''
    }

    if (renderError instanceof Error) {
      return renderError.message || renderError.stack || renderError.toString()
    }

    if (typeof renderError === 'string') {
      return renderError
    }

    try {
      return JSON.stringify(renderError)
    } catch (error) {
      console.error('Failed to stringify render error', error)
      return ''
    }
  }, [renderError])

  const handleRenderError = useCallback((error: unknown) => {
    setRenderError(error ?? new Error('Cesium render error'))
  }, [])

  const handleRetry = useCallback(() => {
    setRetryKey((prev) => prev + 1)
    setRenderError(undefined)
  }, [])

  return (
    <div className="relative h-full w-full">
      <CesiumRenderErrorBoundary
        onError={handleRenderError}
        resetKey={retryKey}
      >
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
          <ErrorListener onRenderError={handleRenderError} />
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
              {globalConfig.env === 'sh-jh' && <ShanghaiWarZoneConfig />}
              {globalConfig.isXiaoshan && <XiaoshanXZZoneConfig />}
              <FloatIconButton onClick={toggle}>
                {is2D ? '2D' : '3D'}
              </FloatIconButton>
            </div>
          )}
          <Suspense fallback={null}>
            {globalConfig.env === 'sh-jh' && (
              <>
                <ShanghaiWarZone />
                <ShanghaiBanRoutes />
                {/* <ShanghaiBanAreas /> */}
              </>
            )}
            {globalConfig.useGuizhouFarm && <GuizhouFarm />}
            {globalConfig.useHangzhouBanAreas && <HangzhouBanAreas />}
            {globalConfig.useGuizhouProjects && <GuizhouProjects />}
            {globalConfig.isBinzhou && <BinzhouDemo />}
            {globalConfig.isXiaoshan && <XiaoshanXZZone />}
          </Suspense>
          <BottomBar />
          <FuzhouJiefangBridge />
        </Viewer>
      </CesiumRenderErrorBoundary>
      {renderError && (
        <div className="absolute inset-0 z-10 bg-black/50 backdrop-blur flex justify-center items-center px-4">
          <div className="flex flex-col gap-3 items-center bg-black/70 border border-white/10 rounded-xl px-6 py-5 max-w-2xl w-full text-white">
            <div className="text-lg font-semibold">
              {t('map.renderError.title', {
                defaultValue: 'Map rendering failed',
              })}
            </div>
            <div className="text-sm text-white/80 text-center">
              {t('map.renderError.description', {
                defaultValue:
                  'Something went wrong while rendering the map. Please try again.',
              })}
            </div>
            {errorDetail && (
              <div className="w-full max-h-40 overflow-auto bg-black/50 text-xs text-red-100 border border-white/10 rounded-lg px-3 py-2 whitespace-pre-wrap break-words">
                <div className="font-medium mb-1 text-white/70">
                  {t('map.renderError.detail', { defaultValue: 'Error detail' })}
                </div>
                <div>{errorDetail}</div>
              </div>
            )}
            <Button type="primary" onClick={handleRetry}>
              {t('map.renderError.retry', { defaultValue: 'Retry' })}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
})

CesiumMap.displayName = 'CesiumMap'

export default CesiumMap
