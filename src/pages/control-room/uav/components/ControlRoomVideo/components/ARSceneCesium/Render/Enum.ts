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

/** 与标注显隐变更关联的其他图元在label层级的primitiveCollection中的索引 */
export enum LabelRelateEnum {
  label = 0, // label本身所在的位置
  // poi的标记点
  poiMarker = 1,
  /** 标绘中的点位 */
  overlayPoint = 2,

  numberOfLabelRelate = 3,
}

/** 虚实融合中标注避让显示的权重 */
export enum LabelLevelEnum {
  aoi = 1,
  road = 2,
  poi = 3,
  /** 标绘的名称 */
  overlayName = 4,
  /** 标绘中的点位 */
  overlayPoint = 5,
}
