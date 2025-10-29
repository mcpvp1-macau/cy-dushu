import { GetProps } from 'antd'
import { Label } from 'resium'
import * as Cesium from 'cesium'

type PropsType = Partial<GetProps<typeof Label>> & {
  text: string
  id: string
  position: Cesium.Cartesian3
}

const DeviceLabel: FC<PropsType> = memo((props) => {
  return (
    <Label
      scale={1}
      horizontalOrigin={Cesium.HorizontalOrigin.CENTER}
      // outlineColor={Cesium.Color.fromCssColorString('#000')}
      outlineWidth={2}
      font="12px sans-serif"
      pixelOffset={new Cesium.Cartesian2(0, 32)}
      // backgroundColor={Cesium.Color.BLACK}
      fillColor={Cesium.Color.WHITE}
      backgroundPadding={new Cesium.Cartesian2(5, 5)}
      disableDepthTestDistance={50000}
      style={Cesium.LabelStyle.FILL_AND_OUTLINE}
      heightReference={Cesium.HeightReference.NONE}
      distanceDisplayCondition={new Cesium.DistanceDisplayCondition(0, 50_000)}
      {...props}
    />
  )
})

DeviceLabel.displayName = 'DeviceLabel'

export default DeviceLabel
