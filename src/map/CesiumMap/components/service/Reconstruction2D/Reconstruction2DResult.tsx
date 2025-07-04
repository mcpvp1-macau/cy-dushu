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
  const currentImagery = useRef<Cesium.ImageryLayer | null>(null)
  const latestUrl = useLatest(data.imageUrl)

  const addImageryProvider = useMemoizedFn(async () => {
    const imageUrl = data.imageUrl
    console.log('imageUrl', imageUrl)
    const provider = (await TIFFImageryProvider.fromUrl(data.imageUrl, {
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
    if (!viewer || !data.imageUrl) {
      return
    }

    addImageryProvider()
  }, [viewer, data.imageUrl])

  useEffect(() => {
    return () => {
      if (currentImagery.current && viewer) {
        viewer.imageryLayers.remove(currentImagery.current, true)
      }
    }
  }, [viewer])

  return null
})

Reconstruction2DResultItem.displayName = 'Reconstruction2DResultItem'

export default Reconstruction2DResultItem
