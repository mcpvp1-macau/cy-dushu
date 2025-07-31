import Reconstruction2DCollection from './Reconstruction2DCollection'
import Reconstruction2DItem from './Reconstruction2DItem'
import useReconstruction2DMapStore, {
  ProcessedResultType,
} from '@/store/map/useReconstruction2DMap.store'
import TiffWMTSLoader4326 from '../common/TiffWMTSLoader4326'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import { useDistanceIsClose } from '@/hooks/cesium/useDistanceIsClose'

const Reconstruction2DProcessItem: FC<{
  e: ProcessedResultType
  cameraPos: number[]
}> = memo(({ e, cameraPos }) => {
  const isClose = useDistanceIsClose(
    4000,
    e.lon,
    e.lat,
    e.alt,
    cameraPos[0],
    cameraPos[1],
    cameraPos[2],
  )

  const isCloseRef = useRef(false)
  if (isClose) {
    isCloseRef.current = true
  }

  if (!isCloseRef.current) {
    return null
  }

  return e.imgType === 'jpeg' ? (
    <Reconstruction2DItem key={e.imgUrl} data={e} />
  ) : e.imgType === 'tiff' ? (
    e.layer &&
    e.bboxMinX &&
    e.bboxMaxX &&
    e.bboxMinY &&
    e.bboxMaxY && (
      <TiffWMTSLoader4326
        key={e.imgUrl}
        layer={e.layer}
        bboxMinX={e.bboxMinX}
        bboxMinY={e.bboxMinY}
        bboxMaxX={e.bboxMaxX}
        bboxMaxY={e.bboxMaxY}
      />
    )
  ) : null
})

type PropsType = unknown
const Reconstruction2D: FC<PropsType> = memo(() => {
  const processResults = useReconstruction2DMapStore((s) => s.processedResults)
  const [cameraPos, setCameraPos] = useState<number[]>([0, 0, 0])
  const { viewer } = useCesium()
  useEffect(() => {
    if (!viewer) {
      return
    }
    // 监听相机变化，更新是否显示
    const camera = viewer.camera
    const fn = () => {
      // 获取相机经纬度高度
      const { longitude, latitude, height } = camera.positionCartographic
      setCameraPos([
        Cesium.Math.toDegrees(longitude),
        Cesium.Math.toDegrees(latitude),
        height,
      ])
    }
    camera.changed.addEventListener(fn)

    return () => {
      camera.changed.removeEventListener(fn)
    }
  }, [])

  return (
    <Reconstruction2DCollection>
      {processResults.map((e) => (
        <Reconstruction2DProcessItem
          key={e.imgUrl}
          e={e}
          cameraPos={cameraPos}
        />
      ))}
    </Reconstruction2DCollection>
  )
})

Reconstruction2D.displayName = 'Reconstruction2D'

export default Reconstruction2D
