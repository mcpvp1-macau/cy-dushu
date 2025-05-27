import data from './GuizhouProjects.json'
import GroundPolygon from '../service/common/GroundPolygon'
import { Billboard, BillboardCollection } from 'resium'
import * as Cesium from 'cesium'
import GroundPolyline from '../service/common/GroundPolyline'

type PropsType = unknown

type p = {
  lng: number
  lat: number
  alt?: number
}

const Marker: FC<{ p: p }> = ({ p }) => {
  const position = Cesium.Cartesian3.fromDegrees(p.lng, p.lat, p.alt)
  return (
    <Billboard
      id={`guizhou-projects-marker-${p.lng}-${p.lat}`}
      position={position}
      image={'/images/marker/icon/weizhi.svg'}
      width={14}
      height={14}
      disableDepthTestDistance={4_000_000}
      heightReference={Cesium.HeightReference.NONE}
    />
  )
}

const GuizhouProjects: FC<PropsType> = memo(() => {
  return (
    <BillboardCollection>
      {data.map((entity) =>
        entity.shapes.map((e, idx) => {
          if (e.type === 'Polygon') {
            return (
              <GroundPolygon
                key={entity.name + idx}
                positions={(e.path as p[]).map((e) => [e.lng, e.lat])}
              />
            )
          }
          if (e.type === 'Polyline') {
            return (
              <GroundPolyline
                key={entity.name + idx}
                outlineColor="#f17313"
                outlineWidth={3}
                positions={(e.path as p[]).map((e) => [e.lng, e.lat])}
              />
            )
          }
          if (e.type === 'Marker') {
            return <Marker key={entity.name + idx} p={e.path as p} />
          }
          return null
        }),
      )}
    </BillboardCollection>
  )
})

GuizhouProjects.displayName = 'GuizhouProjects'

export default GuizhouProjects
