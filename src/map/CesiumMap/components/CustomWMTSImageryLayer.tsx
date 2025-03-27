import { ImageryLayer, useCesium } from 'resium'
import { FC } from 'react'
import * as Cesium from 'cesium'

type PropsType = {
  url: string
}
// https://t0.tianditu.gov.cn/cva_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=tk

const CustomWMTSImageryLayer: FC<PropsType> = ({ url }) => {
  const { viewer } = useCesium()
  console.log('url', url)
  const wmtsProvider = useMemo(() => {
    return new Cesium.WebMapTileServiceImageryProvider({
      url: 'https://t0.tianditu.gov.cn/cva_w/wmts?tk=',
      layer: 'cva',
      style: 'default',
      format: 'image/png',
      tileMatrixSetID: 'EPSG:4326',
    })
  }, [url])
  // 返回包装在div中的ImageryLayer组件
  return (
    <div>
      <ImageryLayer imageryProvider={wmtsProvider} />
    </div>
  )
}

export default CustomWMTSImageryLayer
