import { useCesium } from 'resium'
import TIFFImageryProvider from 'terriajs-tiff-imagery-provider'
import { useLatest, useUnmountedRef } from 'ahooks'
import * as Cesium from 'cesium'
import proj4 from 'proj4'

type PropsType = {
  url: string
}

const TiffLoader32650: FC<PropsType> = memo(({ url }) => {
  const { viewer } = useCesium()
  const unmountedRef = useUnmountedRef()
  const currentImagery = useRef<Cesium.ImageryLayer | null>(null)
  const latestUrl = useLatest(url)

  const addImageryProvider = useMemoizedFn(async () => {
    const imageUrl = url

    const provider = (await TIFFImageryProvider.fromUrl(url, {
      projFunc: (code) => {
        if (code === 32650) {
          proj4.defs(
            'EPSG:32650',
            '+proj=utm +zone=50 +north +datum=WGS84 +units=m +no_defs +type=crs',
          )
          return {
            project: proj4('EPSG:4326', 'EPSG:32650').forward,
            unproject: proj4('EPSG:4326', 'EPSG:32650').inverse,
          }
        }
      },
    })) as unknown as Cesium.ImageryProvider
    if (unmountedRef.current || !viewer || imageUrl !== latestUrl.current) {
      return
    }

    currentImagery.current = viewer.imageryLayers.addImageryProvider(
      provider as unknown as Cesium.ImageryProvider,
    )
  })

  useEffect(() => {
    if (!viewer || !url) {
      return
    }

    addImageryProvider()
  }, [viewer, url])

  useEffect(() => {
    return () => {
      if (currentImagery.current && viewer) {
        viewer.imageryLayers.remove(currentImagery.current, true)
      }
    }
  }, [viewer])

  return null
})

TiffLoader32650.displayName = 'TiffLoader32650'

export default TiffLoader32650
