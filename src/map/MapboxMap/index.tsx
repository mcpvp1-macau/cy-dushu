import { GetProps } from 'antd'
import { type FC } from 'react'
import { Map } from 'react-map-gl'
import MapboxDefaultRaster from './components/MapboxDefault'

type PropsType = GetProps<typeof Map>

const MapboxMap: FC<PropsType> = (props) => {
  return (
    <Map
      initialViewState={{
        longitude: 110,
        latitude: 30,
        zoom: 3,
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
