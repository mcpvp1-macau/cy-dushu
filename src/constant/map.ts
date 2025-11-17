/** 地形地址 */
export const getTerrainUrl = () => {
  return globalConfig.terrainUrl || `/data/maptiler-terrain-rgb/{z}/{x}/{y}.png`
}
