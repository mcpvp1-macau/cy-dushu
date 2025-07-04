import { useCesium } from 'resium'
import TIFFImageryProvider from 'terriajs-tiff-imagery-provider'
import { useLatest, useUnmountedRef } from 'ahooks'
import * as Cesium from 'cesium'
import proj4 from 'proj4'

type PropsType = {
  data: API_RECONSTRUCTION.Reconstruction2DListItem
}

const Reconstruction2DResultItem: FC<PropsType> = memo(({ data }) => {
  const { viewer } = useCesium()
  const unmountedRef = useUnmountedRef()
  const currentImagery = useRef<Cesium.ImageryProvider | null>(null)
  const latestUrl = useLatest(data.imageUrl)

  const addImageryProvider = useMemoizedFn(async () => {
    const imageUrl = data.imageUrl
    const provider = (await TIFFImageryProvider.fromUrl(data.imageUrl, {
      projFunc: (code) => {
        if (code === 32650) {
          proj4.defs(
            'EPSG:6326',
            '+proj=utm +zone=50 +south +datum=WGS84 +units=m +no_defs +type=crs',
          )
          return {
            project: proj4('EPSG:4326', 'EPSG:6326').forward,
            unproject: proj4('EPSG:4326', 'EPSG:6326').inverse,
          }
        }
      },
    })) as unknown as Cesium.ImageryProvider
    if (unmountedRef.current || !viewer || imageUrl !== latestUrl.current) {
      return
    }
    viewer.imageryLayers.addImageryProvider(
      provider as unknown as Cesium.ImageryProvider,
    )
    currentImagery.current = provider
  })

  useEffect(() => {
    if (!viewer) {
      return
    }

    addImageryProvider()
  }, [viewer, data.imageUrl])

  useEffect(() => {
    return () => {
      if (currentImagery.current && viewer) {
        // @ts-ignore
        // viewer.imageryLayers.remove(currentImagery.current, true)
      }
    }
  }, [viewer])

  return null
})

Reconstruction2DResultItem.displayName = 'Reconstruction2DResultItem'

export default Reconstruction2DResultItem
