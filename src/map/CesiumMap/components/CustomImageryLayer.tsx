import { useMapLayerAndOverlayConfigStore } from '@/store/map/useLayerAndOverlay.store'
import { memo, type FC } from 'react'
import createUrlTemplateImageryProvider from './CustomUrlTemplateImageryProvider'
import { ImageryLayer, useCesium } from 'resium'
import * as Cesium from 'cesium'
import { useAsyncEffect } from 'ahooks'
import CustomTMSImageryLayer from './CustomTMSImageryLayer'
type PropsType = {
  url: string
}

const TilesetLayer: FC<PropsType> = memo(({ url }) => {
  const { viewer } = useCesium()

  const tilesetRef = useRef<Cesium.Cesium3DTileset | null>(null)

  const add3DTileset = async (url: string) => {
    const tileset = await Cesium.Cesium3DTileset.fromUrl(url, {
      maximumCacheOverflowBytes: 1024 * 1024 * 10 * 1024, // 缓存溢出字节数
      baseScreenSpaceError: 0.1,
      skipScreenSpaceErrorFactor: 0,
      dynamicScreenSpaceError: true,
      dynamicScreenSpaceErrorDensity: 0.00278,
      dynamicScreenSpaceErrorFactor: 0.1,
      dynamicScreenSpaceErrorHeightFalloff: 0.25,
      maximumScreenSpaceError: 0.1, // 根据需要调整，以平衡加载时间和细节
    })
    tileset && viewer?.scene.primitives.add(tileset)
    tileset && viewer?.zoomTo(tileset)
    tilesetRef.current = tileset
  }

  useAsyncEffect(async () => {
    if (viewer) {
      if (tilesetRef.current) {
        viewer?.scene.primitives.remove(tilesetRef.current)
        tilesetRef.current = null
      }
      await add3DTileset(url)
    }
  }, [viewer, url])

  useEffect(() => {
    return () => {
      try {
        tilesetRef.current &&
          viewer?.scene.primitives.remove(tilesetRef.current)
        tilesetRef.current = null
      } catch (error) {}
    }
  }, [])

  return null
})

const CustomImageryLayer: FC<unknown> = memo(() => {
  const queryClient = useQueryClient()
  const { data } = useQuery(
    {
      queryKey: ['getLocalSpaceList'],
      queryFn: async () => {
        return local.getItem<API_LAYER_OVERLAY.domain.SpaceItem[]>('space_list')
      },
    },
    queryClient,
  )

  const activeSpaceIds = useMapLayerAndOverlayConfigStore(
    (s) => s.activeSpaceIds,
  )

  const providers = useMemo(() => {
    if (!data || !activeSpaceIds || activeSpaceIds.size === 0) {
      return []
    }
    const map = new Map(data.map((e) => [e.spaceId, e]))

    return Array.from(activeSpaceIds)
      .filter((e) => {
        const space = map.get(e)
        return space?.spaceType === 'XYZ'
      })
      .map((e) => {
        const CustomUrlTemplateImageryProvider =
          createUrlTemplateImageryProvider(() => true)
        const provider = new CustomUrlTemplateImageryProvider({
          url: map.get(e)!.spaceMapUrl,
        })
        provider.errorEvent.addEventListener(() => {})
        return provider
      })
  }, [data, activeSpaceIds])

  const tileset = useMemo(() => {
    if (!data || !activeSpaceIds || activeSpaceIds.size === 0) {
      return []
    }
    const map = new Map(data.map((e) => [e.spaceId, e]))

    return Array.from(activeSpaceIds)
      .filter((e) => {
        const space = map.get(e)
        return space?.spaceType === '3D_TILES'
      })
      .map((e) => {
        return map.get(e)!.spaceMapUrl
      })
  }, [data, activeSpaceIds])

  const tms = useMemo(() => {
    if (!data || !activeSpaceIds || activeSpaceIds.size === 0) {
      return []
    }
    const map = new Map(data.map((e) => [e.spaceId, e]))
    return Array.from(activeSpaceIds)
      .filter((e) => {
        const space = map.get(e)
        return space?.spaceType === 'TMS'
      })
      .map((e) => {
        return map.get(e)!.spaceMapUrl
      })
  }, [data, activeSpaceIds])

  return (
    <>
      {providers.map((provider, index) => (
        <ImageryLayer key={index} imageryProvider={provider} />
      ))}
      {tileset.map((t) => (
        <TilesetLayer key={t} url={t} />
      ))}
      {tms.map((t) => (
        <CustomTMSImageryLayer key={t} url={t} />
      ))}
    </>
  )
})

CustomImageryLayer.displayName = 'CustomImageryLayer'

export default CustomImageryLayer
