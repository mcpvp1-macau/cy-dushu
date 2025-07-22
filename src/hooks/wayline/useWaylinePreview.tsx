import XModal from '@/components/XModal'
import MapboxMap from '@/map/MapboxMap'
import { shouldJson } from '@/utils/json'
import { Layer, Source, useMap } from 'react-map-gl'

const WaylinePreview: FC<{ data: API_AIRLINE.domain.AIRLINE_TEMPLATE }> = ({
  data,
}) => {
  const { current: map } = useMap()

  const positions = useMemo(() => {
    return shouldJson(data.parameters)?.spaces?.[0]?.positions || []
  }, [data])

  useEffect(() => {
    if (!map) return

    // 加载航点图标
    if (!map.hasImage('wayline-point-icon')) {
      map.loadImage('/images/airline/inverted-triangle.png', (error, image) => {
        if (error) {
          console.error('Error loading wayline point icon:', error)
          return
        }
        if (image) {
          map.addImage('wayline-point-icon', image)
        }
      })
    }

    if (!positions || !positions.length) {
      return
    }
    let minX = 181
    let minY = 91
    let maxX = -181
    let maxY = -91
    for (const pos of positions) {
      minX = Math.min(minX, pos.pointX)
      minY = Math.min(minY, pos.pointY)
      maxX = Math.max(maxX, pos.pointX)
      maxY = Math.max(maxY, pos.pointY)
    }
    map.fitBounds(
      [
        [minX, minY],
        [maxX, maxY],
      ],
      {
        maxZoom: 17,
        duration: 1000,
        padding: 20,
      },
    )
  }, [positions, map])

  console.log('positions', positions)

  return (
    <>
      {/* 航线 */}
      <Source
        type="geojson"
        id="wayline-preview"
        data={{
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: positions.map((pos) => [pos.pointX, pos.pointY]),
          },
          properties: {},
        }}
      >
        {/* 黑色描边层 */}
        <Layer
          id="wayline-preview-stroke"
          type="line"
          source="wayline-preview"
          layout={{
            'line-cap': 'round',
            'line-join': 'round',
          }}
          paint={{
            'line-color': '#000',
            'line-width': 2.6,
          }}
        />
        {/* 绿色主线层 */}
        <Layer
          id="wayline-preview"
          type="line"
          source="wayline-preview"
          layout={{
            'line-cap': 'round',
            'line-join': 'round',
          }}
          paint={{
            'line-color': '#03D68F',
            'line-width': 2,
          }}
        />
      </Source>

      {/* 航点 */}
      <Source
        type="geojson"
        id="wayline-points"
        data={{
          type: 'FeatureCollection',
          features: positions.map((pos, index) => ({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [pos.pointX, pos.pointY],
            },
            properties: {
              index: index + 1,
              isStart: index === 0,
              isEnd: index === positions.length - 1,
            },
          })),
        }}
      >
        {/* 航点外圈 */}
        <Layer
          id="wayline-points-outer"
          type="symbol"
          source="wayline-points"
          layout={{
            'icon-image': 'wayline-point-icon',
            'icon-size': 0.2,
            'icon-allow-overlap': true,
            'icon-ignore-placement': true,
            'icon-offset': [0, 10],
          }}
        />
        {/* 航点序号 */}
        <Layer
          id="wayline-points-label"
          type="symbol"
          source="wayline-points"
          layout={{
            'text-field': ['get', 'index'],
            'text-font': ['Noto Sans Bold'],
            'text-size': 14,
            'text-anchor': 'center',
            'text-offset': [0, 0],
            'text-allow-overlap': true,
          }}
          paint={{
            'text-color': '#fff',
            'text-halo-color': '#000',
            'text-halo-width': 0.3,
          }}
        />
      </Source>
    </>
  )
}

const useWaylinePreview = () => {
  const [open, setOpen] = useState(false)
  const [currentWayline, setCurrentWayline] =
    useState<API_AIRLINE.domain.AIRLINE_TEMPLATE | null>(null)

  const handlePreview = (wayline: API_AIRLINE.domain.AIRLINE_TEMPLATE) => {
    setCurrentWayline(wayline)
    setOpen(true)
  }

  const holder = useMemo(() => {
    if (!open || !currentWayline) {
      return null
    }

    return (
      <XModal
        title={currentWayline?.taskName || '预览航线'}
        open={open}
        onClose={() => {
          setOpen(false)
          setCurrentWayline(null)
        }}
        footer={false}
        noPadding
        centered
        width={800}
      >
        <div className="w-full aspect-video">
          <MapboxMap style={{ width: '100%', height: '100%' }}>
            <WaylinePreview data={currentWayline} />
          </MapboxMap>
        </div>
      </XModal>
    )
  }, [open, currentWayline])

  return { holder, handlePreview }
}

export default useWaylinePreview
