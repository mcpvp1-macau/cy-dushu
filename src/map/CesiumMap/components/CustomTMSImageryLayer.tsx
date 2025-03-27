import * as Cesium from 'cesium'
import { ImageryLayer } from 'resium'
import { FC, useMemo } from 'react'

/**
 * 组件属性类型定义
 * @typedef PropsType
 * @property {string} url - TMS服务的基础URL
 * @property {[number, number, number, number]} [rectangle] - 图层显示范围，格式：[west, south, east, north]
 * @property {number} [minimumLevel] - 最小缩放级别
 * @property {number} [maximumLevel] - 最大缩放级别
 * @property {'png' | 'jpg'} [fileExtension] - 瓦片图片格式
 */
type PropsType = {
  url: string
  rectangle?: [number, number, number, number]
  minimumLevel?: number
  maximumLevel?: number
  fileExtension?: 'png' | 'jpg'
}

/**
 * 自定义TMS图层组件
 * 用于在Cesium地图中加载TMS(Tile Map Service)服务图层
 */
const CustomTMSImageryLayer: FC<PropsType> = ({
  url,
  rectangle,
  minimumLevel = 5,  // 默认最小缩放级别为5
  maximumLevel = 22, // 默认最大缩放级别为22
  fileExtension = 'png', // 默认使用png格式
}) => {
  // 使用useMemo创建TMS图层提供者，避免不必要的重新创建
  const tmsProvider = useMemo(() => {
    return Cesium.TileMapServiceImageryProvider.fromUrl(url, {
      fileExtension,
      maximumLevel,
      minimumLevel,
      // rectangle参数已被注释，如需使用可取消注释
      // rectangle: Cesium.Rectangle.fromDegrees(...rectangle),
    })
  }, [url, fileExtension, maximumLevel, minimumLevel, rectangle])

  // 返回包装在div中的ImageryLayer组件
  return (
    <div>
      <ImageryLayer imageryProvider={tmsProvider} />
    </div>
  )
}

export default CustomTMSImageryLayer
