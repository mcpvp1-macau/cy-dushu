import { FC } from 'react'
import OrderCesiumRenderController from '@/utils/cesium/OrderCesiumRenderController'
import {
  OverlayCirclePrimitive,
  OverlayFanPrimitive,
} from '@/utils/customPrimitive/OverlayPrimitive'
import * as Cesium from 'cesium'
import { shouldJson } from '@/utils/json'
import { argbToHex } from '@/utils/color'
import { CotType } from '@/store/map/useDraw.store'
import { attempt } from 'lodash'
import { LayerEnum } from '../../Enum'

type PropsType = {
  overlay: API_LAYER_OVERLAY.domain.Overlay
  ocrc: OrderCesiumRenderController
}

const ShowNoFlyArea: FC<PropsType> = ({ overlay, ocrc }) => {
  const wallPrimitiveRef = useRef<Cesium.Primitive | null>(null)

  useEffect(() => {
    let overlayPositions = shouldJson(overlay.overlayPositions)
    if (overlay.cotType === CotType.SHAPE_CIRCLE) {
      overlayPositions = OverlayCirclePrimitive.getCoordinates(
        [
          overlayPositions[0][0],
          overlayPositions[0][1],
          overlayPositions[0][2],
        ],
        overlayPositions[0][3],
      )
    } else if (overlay.cotType === CotType.SHAPE_FAN) {
      overlayPositions = OverlayFanPrimitive.getCoordinates(
        overlayPositions[0][0],
        overlayPositions[0][1],
        overlayPositions[0][2],
      )
    }
    const style = shouldJson(overlay.overlayStyleConfig)

    const fillColor =
      argbToHex(String(style?.fillColor?.['-value']))?.[0] || '#4c90f0'

    wallPrimitiveRef.current = new Cesium.Primitive({
      geometryInstances: new Cesium.GeometryInstance({
        geometry: new Cesium.WallGeometry({
          positions: Cesium.Cartesian3.fromDegreesArrayHeights(
            overlayPositions.flat(),
          ),
          maximumHeights: overlayPositions.map(
            (item: number[]) => item[2] + 200,
          ),
          minimumHeights: overlayPositions.map((item: number[]) => item[2]),
        }),
      }),
      appearance: new Cesium.MaterialAppearance({
        material: new Cesium.Material({
          fabric: {
            type: 'linear-gridient',
            uniforms: {
              bottomOpacity: 0.5,
              topOpacity: 0,
              color: Cesium.Color.fromCssColorString(fillColor),
            },
            source: `
              uniform vec4 color;
              uniform float bottomOpacity;
              uniform float topOpacity;

              czm_material czm_getMaterial(czm_materialInput materialInput) {
                czm_material material = czm_getDefaultMaterial(materialInput);
                vec2 st = materialInput.st;

                float opacity = mix(bottomOpacity, topOpacity, st.t);
       
                material.diffuse = color.rgb;
                material.alpha = opacity;
                return material;
              }
            `,
          },
        }),
      }),
    })
    // 禁飞区可以遮挡label，所以添加到label层级
    ocrc.orderPrimitives[LayerEnum.label].add(wallPrimitiveRef.current)

    return () => {
      attempt(() => {
        wallPrimitiveRef.current?.destroy()
        ocrc.orderPrimitives[LayerEnum.label].remove(wallPrimitiveRef.current)
      })
    }
  }, [overlay])

  return <></>
}

ShowNoFlyArea.displayName = 'ShowNoFlyArea'

export default memo(ShowNoFlyArea)
