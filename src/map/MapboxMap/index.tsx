import { GetProps } from 'antd'
import { Map } from 'react-map-gl'
import MapboxDefaultRaster from './components/MapboxDefault'
import 'mapbox-gl/dist/mapbox-gl.css'

type PropsType = GetProps<typeof Map>

const MapboxMap: FC<PropsType> = (props) => {
  return (
    <Map
      initialViewState={{
        longitude: 110,
        latitude: 30,
        zoom: 3,
      }}
      mapStyle={{
        glyphs: `/ja-map/fonts/{fontstack}/{range}.pbf`,
        version: 8,
        sources: {},
        layers: [],
      }}
      maxZoom={18}
      {...props}
    >
      <MapboxDefaultRaster />
      {props.children}
    </Map>
  )
}

export default MapboxMap
