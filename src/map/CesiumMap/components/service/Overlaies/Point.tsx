import { argbToHex } from '@/utils/color'
import { shouldJson } from '@/utils/json'
import { Label, useCesium } from 'resium'
import * as Cesium from 'cesium'
import { useMapLayerAndOverlayConfigStore } from '@/store/map/useLayerAndOverlay.store'
import { attempt } from 'lodash'

type PropsType = {
  data: API_LAYER_OVERLAY.domain.Overlay
}

/** 覆盖物 - 打点 */
const OverlayPoint: FC<PropsType> = memo(({ data }) => {
  const postion = shouldJson(data.overlayPositions)?.[0]

  const hiddenOverlayIds = useMapLayerAndOverlayConfigStore(
    (s) => s.hiddenOverlayIds,
  )
  const hiddenLayerIds = useMapLayerAndOverlayConfigStore(
    (s) => s.hiddenLayerIds,
  )

  const { viewer } = useCesium()

  useEffect(() => {
    if (!viewer) {
      return
    }
    if (
      hiddenOverlayIds.has(data.overlayId) ||
      hiddenLayerIds.has(data.layerId)
    ) {
      return
    }

    if (!postion) {
      return
    }

    const styleConfig = shouldJson(data.overlayStyleConfig)

    const isTransparent = styleConfig.color['-argb'] === '0'
    const hex = isTransparent
      ? '0'
      : argbToHex(String(styleConfig.color['-argb']))[0]
    const position = Cesium.Cartesian3.fromDegrees(
      postion[0],
      postion[1],
      postion[2] ?? 0,
    )

    const entity = new Cesium.Entity({
      id: `overlay--${data.overlayId}--${data.overlayType}`,
      position,
      point: {
        color: Cesium.Color.fromCssColorString(hex),
        pixelSize: 10,
        outlineColor: Cesium.Color.fromCssColorString('#fff'),
        outlineWidth: 1,
        show: true,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
          0,
          500_000,
        ),
        disableDepthTestDistance: Infinity,
      },
    })

    viewer.entities.add(entity)

    return () => {
      attempt(() => {
        viewer.entities.remove(entity)
      })
    }
  }, [hiddenOverlayIds, hiddenLayerIds, data.overlayId, data.layerId, postion])

  if (
    hiddenOverlayIds.has(data.overlayId) ||
    hiddenLayerIds.has(data.layerId)
  ) {
    return null
  }

  if (!postion) {
    return null
  }

  const position = Cesium.Cartesian3.fromDegrees(
    postion[0],
    postion[1],
    postion[2] ?? 0,
  )

  return (
    <>
      <Label
        id={`overlay--${data.overlayId}--${data.overlayType}`}
        position={position}
        scale={0.2}
        verticalOrigin={Cesium.VerticalOrigin.BOTTOM}
        horizontalOrigin={Cesium.HorizontalOrigin.CENTER}
        text={data.overlayName}
        outlineColor={Cesium.Color.fromCssColorString('#000')}
        outlineWidth={5}
        font="700 64px Helvetica"
        pixelOffset={new Cesium.Cartesian2(0, 20)}
        backgroundColor={Cesium.Color.BLACK}
        fillColor={Cesium.Color.WHITE}
        backgroundPadding={new Cesium.Cartesian2(5, 5)}
        disableDepthTestDistance={Infinity}
        style={Cesium.LabelStyle.FILL_AND_OUTLINE}
        heightReference={Cesium.HeightReference.CLAMP_TO_GROUND}
        distanceDisplayCondition={
          new Cesium.DistanceDisplayCondition(0, 200_000)
        }
      />
    </>
  )
})

OverlayPoint.displayName = 'OverlayPoint'

export default OverlayPoint
