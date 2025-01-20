import {
  Billboard,
  BillboardCollection,
  Label,
  LabelCollection,
  useCesium,
} from 'resium'
import * as Cesium from 'cesium'
import { attempt } from 'lodash'
import { Fragment } from 'react'

type PropsType = {
  data: number[][]
}

function computeCircle(radius: number) {
  const positions: Cesium.Cartesian2[] = []
  for (let i = 0; i < 360; i++) {
    const radians = Cesium.Math.toRadians(i)
    positions.push(
      new Cesium.Cartesian2(
        radius * Math.cos(radians),
        radius * Math.sin(radians),
      ),
    )
  }
  return positions
}

const ARSceneAirline: FC<PropsType> = memo(({ data }) => {
  const { viewer } = useCesium()
  useEffect(() => {
    if (!viewer || data.length < 2) {
      return
    }

    const positions = Cesium.Cartesian3.fromDegreesArrayHeights(data.flat())
    const polyline = viewer.entities.add({
      polylineVolume: {
        positions,
        shape: computeCircle(6),
        material: new Cesium.ImageMaterialProperty({
          image: '/images/mask/liner.png',
          color: Cesium.Color.fromCssColorString('#22c55e').withAlpha(0.4),
        }),
        cornerType: Cesium.CornerType.ROUNDED,
      },
    })

    return () => {
      attempt(() => {
        viewer.entities.remove(polyline)
      })
    }
  })

  return (
    <BillboardCollection>
      <LabelCollection>
        {data.map((item, index) => {
          return (
            <Fragment key={index}>
              <Billboard
                key={`billboard-${index}`}
                position={Cesium.Cartesian3.fromDegrees(
                  item[0],
                  item[1],
                  item[2] + 20,
                )}
                image="/images/airline/inverted-triangle.svg"
                width={24}
                height={24}
              />
              <Label
                key={`label-${index}`}
                position={Cesium.Cartesian3.fromDegrees(
                  item[0],
                  item[1],
                  item[2] + 20,
                )}
                text={(index + 1).toString()}
                font="14px sans-serif"
                fillColor={Cesium.Color.WHITE}
                outlineColor={Cesium.Color.WHITE}
                pixelOffset={new Cesium.Cartesian2(0, -3)}
                eyeOffset={new Cesium.Cartesian3(0, 0, -1)}
                outlineWidth={0}
                horizontalOrigin={Cesium.HorizontalOrigin.CENTER}
                verticalOrigin={Cesium.VerticalOrigin.CENTER}
                style={Cesium.LabelStyle.FILL_AND_OUTLINE}
              />
            </Fragment>
          )
        })}
      </LabelCollection>
    </BillboardCollection>
  )
})

ARSceneAirline.displayName = 'ARSceneAirline'

export default ARSceneAirline
