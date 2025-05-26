import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import { useAsyncEffect, useUnmount } from 'ahooks'
import { getSpaceDistance } from '@/utils/geo-math'
import { attempt } from 'lodash'

type PropsType = unknown

const FuzhouJiefangBridge: FC<PropsType> = memo(() => {
  const { viewer } = useCesium()

  const [distance, setDistance] = useState(0x3f3f3f)
  const isShow = distance < 10_000
  const [tileSet, setTileSet] = useState<Cesium.Cesium3DTileset | null>(null)

  useEffect(() => {
    if (!viewer) {
      return
    }

    const camera = viewer.camera

    const fn = () => {
      // 获取相机经纬度高度
      const { longitude, latitude, height } = camera.positionCartographic

      setDistance(
        getSpaceDistance([
          [
            Cesium.Math.toDegrees(longitude),
            Cesium.Math.toDegrees(latitude),
            height,
          ],
          [119.30715, 26.052437, 0],
        ]),
      )
    }

    camera.changed.addEventListener(fn)

    return () => {
      camera.changed.removeEventListener(fn)
    }
  }, [])

  const isFetched = useRef(false)
  useAsyncEffect(async () => {
    if (tileSet || !isShow || isFetched.current || !viewer) {
      return
    }
    isFetched.current = true
    try {
      const _tileSet = await Cesium.Cesium3DTileset.fromUrl(
        '/ja-map/fuzhou_jiefang_bridge_pnts/tileset.json',
        {},
      )
      _tileSet.style = new Cesium.Cesium3DTileStyle({
        pointSize: 5,
      })
      setTileSet(_tileSet)
      viewer.scene.primitives.add(_tileSet)
    } finally {
      isFetched.current = false
    }
  }, [isShow, tileSet])

  useUnmount(() => {
    if (tileSet) {
      attempt(() => {
        viewer?.scene.primitives.remove(tileSet)
      })
    }
  })

  return null
})

FuzhouJiefangBridge.displayName = 'FuzhouJiefangBridge'

export default FuzhouJiefangBridge
