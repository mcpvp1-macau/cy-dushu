import cover from '@mapbox/tile-cover'

export const tileCovers = (
  bounds: GeoJSON.Geometry,
  options: { min_zoom: number; max_zoom: number },
) => {
  const xyzArray = cover.tiles(bounds, options)
  return xyzArray
}
