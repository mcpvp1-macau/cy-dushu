import { Button } from 'antd'

type Props = {
  error: unknown
  onRetry: () => void
}

const RenderErrorOverlay: FC<Props> = ({ error, onRetry }) => {
  const { t } = useTranslation()

  const errorDetail = useMemo(() => {
    if (!error) {
      return ''
    }

    if (error instanceof Error) {
      return error.message || error.stack || error.toString()
    }

    if (typeof error === 'string') {
      return error
    }

    try {
      return JSON.stringify(error)
    } catch (stringifyError) {
      console.error('Failed to stringify render error', stringifyError)
      return ''
    }
  }, [error])

  const browserInfo = useMemo(() => {
    const uaData = (navigator as any)?.userAgentData?.brands

    if (Array.isArray(uaData) && uaData.length > 0) {
      return uaData
        .map((item: { brand: string; version: string }) => `${item.brand} ${item.version}`)
        .join(', ')
    }

    return navigator?.userAgent ?? ''
  }, [])

  const [gpuInfo, setGpuInfo] = useState('')

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas')
      const gl =
        canvas.getContext('webgl', { preserveDrawingBuffer: false }) ||
        canvas.getContext('experimental-webgl', { preserveDrawingBuffer: false })

      if (!gl || !(gl instanceof WebGLRenderingContext)) {
        return
      }

      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
      const vendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : undefined
      const renderer = debugInfo
        ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
        : gl.getParameter(gl.RENDERER)
      const info = [vendor, renderer].filter(Boolean).join(' ')

      setGpuInfo(info)
    } catch (gpuError) {
      console.error('Failed to get GPU info', gpuError)
    }
  }, [])

  const displayBrowserInfo =
    browserInfo ||
    t('map.renderError.browserInfoUnknown', { defaultValue: 'Unknown browser information' })

  const displayGpuInfo =
    gpuInfo || t('map.renderError.gpuInfoUnknown', { defaultValue: 'Unknown graphics device' })

  return (
    <div className="absolute inset-0 z-10 bg-black/50 backdrop-blur flex justify-center items-center px-4">
      <div className="flex flex-col gap-3 items-center bg-black/70 border border-white/10 rounded-xl px-6 py-5 max-w-2xl w-full text-white">
        <div className="text-lg font-semibold">
          {t('map.renderError.title', {
            defaultValue: 'Map rendering failed',
          })}
        </div>
        <div className="text-sm text-white/80 text-center">
          {t('map.renderError.description', {
            defaultValue: 'Something went wrong while rendering the map. Please try again.',
          })}
        </div>
        {errorDetail && (
          <div className="w-full max-h-40 overflow-auto bg-black/50 text-xs text-red-100 border border-white/10 rounded-lg px-3 py-2 whitespace-pre-wrap break-words">
            <div className="font-medium mb-1 text-white/70">
              {t('map.renderError.detail', {
                defaultValue: 'Error detail',
              })}
            </div>
            <div>{errorDetail}</div>
          </div>
        )}
        <div className="w-full bg-black/40 text-xs text-white/80 border border-white/10 rounded-lg px-3 py-2 space-y-2">
          <div className="font-medium text-white/70">
            {t('map.renderError.environment', { defaultValue: 'Environment information' })}
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1">
              <div className="text-white/60">
                {t('map.renderError.browser', { defaultValue: 'Browser' })}
              </div>
              <div className="text-white break-words">{displayBrowserInfo}</div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-white/60">
                {t('map.renderError.gpu', { defaultValue: 'Graphics card' })}
              </div>
              <div className="text-white break-words">{displayGpuInfo}</div>
            </div>
          </div>
        </div>
        <Button type="primary" onClick={onRetry} className="mt-2">
          {t('map.renderError.retry', { defaultValue: 'Retry' })}
        </Button>
      </div>
    </div>
  )
}

RenderErrorOverlay.displayName = 'RenderErrorOverlay'

export default RenderErrorOverlay
