import { useCesium } from 'resium'
import { AutoAIPhotoParams } from '../../../AsideButtons/IntelligentPhotograph'
import { attempt } from 'lodash'
import mitt from 'mitt'
import * as Cesium from 'cesium'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'

type PropsType = unknown

export const autoAIPhotoParamsPredictEmitter = mitt<{
  autoAIPhotoParams: AutoAIPhotoParams
}>()

const AIPhotoPredict: FC<PropsType> = memo(() => {
  const { viewer } = useCesium()
  const [autoAIPhotoParams, setAutoAIPhotoParams] =
    useState<AutoAIPhotoParams>(null)

  const alt = useUavControlRoomStore((s) => s.state.altitude) ?? 0
  const height = useUavControlRoomStore((s) => s.state.height) ?? 0

  const diff = alt - height

  useEffect(() => {
    if (!viewer || !autoAIPhotoParams) {
      return
    }

    const { mid_point, point1, point2 } = autoAIPhotoParams
    const midPoint = Cesium.Cartesian3.fromDegrees(
      mid_point.lon,
      mid_point.lat,
      mid_point.UAV_height + diff,
    )
    const point1Cartesian = Cesium.Cartesian3.fromDegrees(
      point1.lon,
      point1.lat,
      point1.UAV_height + diff,
    )
    const point2Cartesian = Cesium.Cartesian3.fromDegrees(
      point2.lon,
      point2.lat,
      point2.UAV_height + diff,
    )

    const entity = new Cesium.Entity({
      position: midPoint,
      point: {
        color: Cesium.Color.fromCssColorString('#4c90f0'),
        pixelSize: 10,
        outlineColor: Cesium.Color.fromCssColorString('#fff'),
        outlineWidth: 1,
        show: true,
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
          0,
          500_000,
        ),
        disableDepthTestDistance: Infinity,
      },
    })

    const entity1 = new Cesium.Entity({
      position: point1Cartesian,
      point: {
        color: Cesium.Color.fromCssColorString('#4c90f0'),
        pixelSize: 10,
        outlineColor: Cesium.Color.fromCssColorString('#fff'),
        outlineWidth: 1,
        show: true,
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
          0,
          500_000,
        ),
        disableDepthTestDistance: Infinity,
      },
    })

    const entity2 = new Cesium.Entity({
      position: point2Cartesian,
      point: {
        color: Cesium.Color.fromCssColorString('#4c90f0'),
        pixelSize: 10,
        outlineColor: Cesium.Color.fromCssColorString('#fff'),
        outlineWidth: 1,
        show: true,
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
          0,
          500_000,
        ),
        disableDepthTestDistance: Infinity,
      },
    })

    viewer.entities.add(entity)
    viewer.entities.add(entity1)
    viewer.entities.add(entity2)

    return () => {
      attempt(() => {
        viewer.entities.remove(entity)
        viewer.entities.remove(entity1)
        viewer.entities.remove(entity2)
      })
    }
  }, [autoAIPhotoParams])

  useEffect(() => {
    autoAIPhotoParamsPredictEmitter.on('autoAIPhotoParams', (params) => {
      setAutoAIPhotoParams(params)
    })
    return () => {
      autoAIPhotoParamsPredictEmitter.off('autoAIPhotoParams')
    }
  }, [])

  return null
})

AIPhotoPredict.displayName = 'AIPhotoPredict'

export default AIPhotoPredict
