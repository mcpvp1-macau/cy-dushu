import { CotType } from '@/store/map/useDraw.store'
import { useCesium } from 'resium'
import useRightMode from '@/store/layout/useRightMode.store'
import useMapDrawStore from '@/store/map/useDraw.store'
import ShowCircle from '../Overlaies/ShowCircle'
import ShowPolygon from '../Overlaies/ShowPolygon'
import ShowFan from '../Overlaies/ShowFan'
import useFlightAreaStore, {
  useFlightAreaConfigStore,
} from '@/store/map/useFlightArea.store'
import { RightModeEnum } from '@/enum/right-mode'
import NoFlyZonePrimitives from './NoFlyZonePrimitives'
import config from '@/global/config'
import * as Cesium from 'cesium'

type PropsType = unknown

/** 渲染覆盖物形状 */
const renderOverlayShape = (
  overlay: API_LAYER_OVERLAY.domain.Overlay,
  primitives: Cesium.PrimitiveCollection | undefined,
) => {
  if (overlay.cotType === CotType.SHAPE_CIRCLE) {
    return (
      <ShowCircle
        key={overlay.overlayId}
        overlayExtType={'flightArea'}
        primitives={primitives}
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
        primitives={primitives}
        overlay={overlay}
      />
    )
  }
  if (overlay.cotType === CotType.SHAPE_FAN) {
    return (
      <ShowFan
        key={overlay.overlayId}
        overlayExtType={'flightArea'}
        primitives={primitives}
        overlay={overlay}
      />
    )
  }
  return null
}

/** 渲染飞行区域 */
const FlightAreas: FC<PropsType> = memo(() => {
  // 其他状态和覆盖物一样，编辑中也同样隐藏，考虑到覆盖物和飞行区域id会重复
  // 所以在覆盖物和飞行区域中添加对当前详情类型的判断，不能只判断id

  const hiddenOverlayIds = useFlightAreaConfigStore((s) => s.hiddenOverlayIds)
  const flightAreaList = useFlightAreaStore((s) => s.flightAreaList)
  const isEdit = useMapDrawStore((s) => s.isEdit)
  const rightMode = useRightMode((s) => s.rightMode)
  const detailId = useRightMode((s) => s.detailId)

  const customOverlays = useMemo(() => {
    // 去掉大疆禁飞区
    const customFlightArea = flightAreaList.filter(
      (item) => item.layerId !== -1,
    )

    // 去掉隐藏的飞行区域
    const showingCustomFlightArea = customFlightArea.filter(
      (item) => !hiddenOverlayIds.has(item.overlayId),
    )

    if (rightMode !== RightModeEnum.FLIGHT_AREA_DETAIL)
      return showingCustomFlightArea

    if (!detailId || !isEdit) {
      return showingCustomFlightArea
    } else {
      const newOverlays: API_LAYER_OVERLAY.domain.Overlay[] = []
      showingCustomFlightArea.forEach((item) => {
        if (String(item.overlayId) !== detailId) {
          newOverlays.push(item)
        }
      })
      return newOverlays
    }
  }, [detailId, flightAreaList, isEdit, hiddenOverlayIds])

  const djOverlays = useMemo(() => {
    return flightAreaList.filter(
      (item) => item.layerId === -1 && !hiddenOverlayIds.has(item.overlayId),
    )
  }, [flightAreaList, hiddenOverlayIds])

  const { viewer } = useCesium()
  const primitives = useMemo(() => viewer?.scene.primitives, [viewer])

  return (
    <>
      {customOverlays.map((overlay) => renderOverlayShape(overlay, primitives))}
      {config.noFlyZoneDisplayStyle === 'fence' ? (
        djOverlays.map((overlay) => renderOverlayShape(overlay, primitives))
      ) : (
        <NoFlyZonePrimitives
          overlays={djOverlays}
          primitives={primitives}
          isGround={true}
        />
      )}
    </>
  )
})

FlightAreas.displayName = 'FlightAreas'

export default FlightAreas
