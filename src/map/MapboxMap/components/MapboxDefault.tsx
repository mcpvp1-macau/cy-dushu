import { memo, type FC } from 'react'
import { Layer, Source } from 'react-map-gl'

type PropsType = unknown

/** mapbox 默认光栅 */
const MapboxDefaultRaster: FC<PropsType> = memo(() => {
  useMemo(() => {
    if (!globalConfig.defaultImageries) {
      return []
    }
    return globalConfig.defaultImageries
  }, [globalConfig.defaultImageries])

  return (
    <>
      {globalConfig.defaultImageries?.map((e, i) => (
        <Source
          key={i}
          id={`default-map-${i}`}
          type="raster"
          tiles={[e.url]}
          tileSize={256}
        >
          <Layer
            id={`default-map-${i}`}
            type="raster"
            source={`default-map-${i}`}
            layout={{ visibility: 'visible' }}
            minzoom={e.min ?? 0}
            maxzoom={(e.max ?? 18) + 1}
          />
        </Source>
      ))}
    </>
  )
})

MapboxDefaultRaster.displayName = 'MapboxDefault'

export default MapboxDefaultRaster
