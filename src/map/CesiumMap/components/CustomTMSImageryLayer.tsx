import * as Cesium from 'cesium'
import { ImageryLayer } from 'resium'
import { FC, useMemo } from 'react'
type PropsType = {
  url: string
  rectangle?: [number, number, number, number]
  minimumLevel?: number
  maximumLevel?: number
  fileExtension?: 'png' | 'jpg'
}

const CustomTMSImageryLayer: FC<PropsType> = ({
  url = 'http://test.4a.jing-an.com:32712/ja-map/xyz',
  rectangle = [
    119.94757024932727, 30.2695042294763, 119.96582689070627, 30.28094868850794,
  ],
  minimumLevel = 5,
  maximumLevel = 22,
  fileExtension = 'png',
}) => {
  const tmsProvider = useMemo(() => {
    return Cesium.TileMapServiceImageryProvider.fromUrl(url, {
      fileExtension,
      maximumLevel,
      minimumLevel,
      rectangle: Cesium.Rectangle.fromDegrees(...rectangle),
    })
  }, [url, fileExtension, maximumLevel, minimumLevel, rectangle])

  return (
    <div>
      <ImageryLayer imageryProvider={tmsProvider} />
    </div>
  )
}

export default CustomTMSImageryLayer
