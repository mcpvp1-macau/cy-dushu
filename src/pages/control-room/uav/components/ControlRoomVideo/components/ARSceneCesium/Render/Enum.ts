/** 各个类型的数据所在的cesium渲染层次，也对应orderRenderCesium的orderPrimitives中的索引 */
export enum LayerEnum {
  baseAoi = 0,
  build = 1,
  road = 1,
  wayline = 2,
  overlay = 2,
  flightArea = 2,
  label = 3,

  numberOfLayer = 4,
}

/** 虚实融合中标注避让显示的权重 */
export enum LabelLevelEnum {
  aoi = 1,
  road = 2,
  poi = 3,
  overlayLabel = 4,
  overlayPoint = 5,
}
