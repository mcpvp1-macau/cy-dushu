import { CotType } from '@/store/map/useDraw.store'
import useMapLayerAndOverlayStore from '@/store/map/useLayerAndOverlay.store'
import { LabelCollection, PointPrimitiveCollection } from 'resium'
import useRightMode from '@/store/layout/useRightMode.store'
import useMapDrawStore from '@/store/map/useDraw.store'
import ShowCircle from '../Overlaies/ShowCircle'
import ShowPolygon from '../Overlaies/ShowPolygon'
import ShowFan from '../Overlaies/ShowFan'
import useFlightAreaStore from '@/store/map/useFlightArea.store'
import { RightModeEnum } from '@/enum/right-mode'

type PropsType = unknown

/** 渲染飞行区域 */
const FlightAreas: FC<PropsType> = memo(() => {
  // 其他状态和覆盖物一样，编辑中也同样隐藏，考虑到覆盖物和飞行区域id会重复
  // 所以在覆盖物和飞行区域中添加对当前详情类型的判断，不能只判断id

  const flightAreaList = useFlightAreaStore((s) => s.flightAreaList)
  const isEdit = useMapDrawStore((s) => s.isEdit)
  const rightMode = useRightMode((s) => s.rightMode)
  const detailId = useRightMode((s) => s.detailId)

  const overlays = useMemo(() => {
    if (rightMode !== RightModeEnum.FLIGHT_AREA_DETAIL) return flightAreaList

    return flightAreaList
  }, [detailId, flightAreaList, isEdit])

  return (
    <>
      {overlays.map((overlay) => {
        if (overlay.cotType === CotType.SHAPE_CIRCLE) {
          return (
            <ShowCircle
              key={overlay.overlayId}
              overlayExtType={'flightArea'}
              overlay={overlay}
            />
          )
        }
        if (
          overlay.cotType === CotType.SHAPE_POLYGON ||
          overlay.cotType === CotType.SHAPE_RECT
        ) {
          return (
            <ShowPolygon
              key={overlay.overlayId}
              overlayExtType={'flightArea'}
              overlay={overlay}
            />
          )
        }
        if (overlay.cotType === CotType.SHAPE_FAN) {
          return (
            <ShowFan
              key={overlay.overlayId}
              overlayExtType={'flightArea'}
              overlay={overlay}
            />
          )
        }
      })}
    </>
  )
})

FlightAreas.displayName = 'FlightAreas'

export default FlightAreas
