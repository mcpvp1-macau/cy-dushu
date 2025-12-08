import {ImageryLayer} from 'resium'
import { FC } from 'react'
import * as Cesium from 'cesium'
import { shouldJson } from '@/utils/json'

type PropsType = {
  url: string
  layer?: string
  style?: string
  format?: string
  tileMatrixSetID?: string
  tileMatrixLabels?: string[]
  spaceConfig?: string
}
// https://t0.tianditu.gov.cn/cva_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=tk

const CustomWMTSImageryLayer: FC<PropsType> = ({ url, spaceConfig }) => {
  const wmtsProvider = useMemo(() => {
    const config = spaceConfig ? shouldJson(spaceConfig) : null
    const {
      layer,
      style,
      format,
      tileMatrixSetID,
      tileMatrixLabels,
      tilingScheme,
    } = config || {}

    console.log(
      'url',
      url,
      layer,
      style,
      format,
      tileMatrixSetID,
      tileMatrixLabels,
    )

    const labels = tileMatrixLabels ? shouldJson(tileMatrixLabels) : undefined
    console.log('labels', labels)

    return new Cesium.WebMapTileServiceImageryProvider({
      url: url,
      layer: layer || 'img',
      style: style || 'default',
      format: format || 'image/png',
      tileMatrixSetID: tileMatrixSetID || 'w',
      tilingScheme:
        tilingScheme === 'GeographicTilingScheme'
          ? new Cesium.GeographicTilingScheme()
          : new Cesium.WebMercatorTilingScheme(),
      // tilingScheme: new Cesium.WebMercatorTilingScheme(),
      tileMatrixLabels: labels || undefined,
    })
  }, [url, spaceConfig])
  // 返回包装在div中的ImageryLayer组件
  return (
    <div>
      <ImageryLayer imageryProvider={wmtsProvider} />
    </div>
  )
}

export default CustomWMTSImageryLayer
