import { memo, type FC } from 'react'
import { ImageryLayer } from 'resium'
import createUrlTemplateImageryProvider from './CustomUrlTemplateImageryProvider'

type PropsType = unknown

const DefaultImageryLayer: FC<PropsType> = memo(() => {
  const providers = useMemo(() => {
    if (!globalConfig.defaultImageries) {
      return []
    }
    return globalConfig.defaultImageries.map((e) => {
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
