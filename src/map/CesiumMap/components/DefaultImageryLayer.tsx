import { ImageryLayer } from 'resium'
import createUrlTemplateImageryProvider from './CustomUrlTemplateImageryProvider'
import { BaiduImageryProvider } from '@/utils/map/baidu_imagery2/BaiduImageryProvider'
import { ImageryProvider } from 'cesium'

type PropsType = unknown

const DefaultImageryLayer: FC<PropsType> = memo(() => {
  const providers = useMemo(() => {
    if (!globalConfig.defaultImageries) {
      return []
    }
    return globalConfig.defaultImageries.map((e) => {
      if (e.crs === 'baidu') {
        const provider = new BaiduImageryProvider({
          url: e.url,
          crs: 'WGS84',
          type: 'vec_label_w',
        })
        return provider as unknown as ImageryProvider
      }

      const CustomUrlTemplateImageryProvider = createUrlTemplateImageryProvider(
        (l) => l >= (e.min ?? 0) && l <= (e.max ?? 18),
      )
      const provider = new CustomUrlTemplateImageryProvider({
        url: e.url,
      })
      provider.errorEvent.addEventListener(() => {})
      return provider
    })
  }, [])

  return (
    <>
      {providers.map(
        (provider, index) => (
          <ImageryLayer key={index} imageryProvider={provider} />
        ),
        // null,
      )}
    </>
  )
})

DefaultImageryLayer.displayName = 'DefaultImageryLayer'

export default DefaultImageryLayer
