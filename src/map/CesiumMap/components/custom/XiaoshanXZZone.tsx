import _data from './xiaoshanXZZone.json'
import GroundPolygon from '../service/common/GroundPolygon'
import { Label, LabelCollection, useCesium } from 'resium'
import { Fragment } from 'react/jsx-runtime'
import * as Cesium from 'cesium'
import { bbox, center } from '@turf/turf'
import mitt from 'mitt'
import useXiaoshanXZZoneStore from '@/store/map/useXiaoshanXZZone.store'

const data = _data as GeoJSON.FeatureCollection<GeoJSON.Polygon>

let i = 0
for (const e of data.features) {
  e.properties!.id = i++
}

type PropsType = unknown

export const XiaoshanXZZoneEmitter = mitt<{
  fitZone: number
}>()

const XiaoshanXZZone: FC<PropsType> = memo(() => {
  const centerMap = useMemo(() => {
    return new Map<number, [number, number]>(
      data.features.map((e) => {
        const c = center(e as GeoJSON.Feature)
        return [
          e.properties!.name,
          [c.geometry.coordinates[0], c.geometry.coordinates[1]],
        ]
      }),
    )
  }, [data])

  const bboxMap = useMemo(() => {
    return new Map<number, ReturnType<typeof bbox>>(
      data.features.map((e) => {
        const b = bbox(e)
        return [e.properties!.id, b]
      }),
    )
  }, [data])

  const hiddenZones = useXiaoshanXZZoneStore((s) => s.hiddenZones)

  const { viewer } = useCesium()
  const flyFn = useMemoizedFn((id: number) => {
    const b = bboxMap.get(id)
    if (!b) return
    viewer?.camera.flyTo({
      destination: Cesium.Rectangle.fromDegrees(b[0], b[1], b[2], b[3]),
      duration: 1,
      complete: () => {
        viewer?.camera.lookAtTransform(Cesium.Matrix4.IDENTITY)
      },
    })
  })

  useEffect(() => {
    XiaoshanXZZoneEmitter.on('fitZone', flyFn)
    return () => {
      XiaoshanXZZoneEmitter.off('fitZone', flyFn)
    }
  }, [flyFn])

  return (
    <LabelCollection>
      {data.features
        .filter((e) => !hiddenZones.has(e.properties!.id))
        .map((e) => (
          <Fragment key={e.properties!.id}>
            <GroundPolygon
              positions={e.geometry.coordinates![0]}
              outlineColor={`${e.properties?.stroke}66`}
              fillColor={`${e.properties?.fill}22`}
            />
            <Label
              id={e.properties!.name}
              scale={0.1}
              horizontalOrigin={Cesium.HorizontalOrigin.CENTER}
              outlineColor={Cesium.Color.fromCssColorString('#000')}
              outlineWidth={4}
              font="600 112px Helvetica"
              pixelOffset={new Cesium.Cartesian2(0, 32)}
              backgroundColor={Cesium.Color.BLACK}
              fillColor={Cesium.Color.WHITE}
              backgroundPadding={new Cesium.Cartesian2(5, 5)}
              disableDepthTestDistance={50000}
              style={Cesium.LabelStyle.FILL_AND_OUTLINE}
              heightReference={Cesium.HeightReference.NONE}
              distanceDisplayCondition={
                new Cesium.DistanceDisplayCondition(0, 50_000)
              }
              position={Cesium.Cartesian3.fromDegrees(
                centerMap.get(e.properties!.name)?.[0] ?? 0,
                centerMap.get(e.properties!.name)?.[1] ?? 0,
              )}
              text={e.properties!.name}
            ></Label>
          </Fragment>
        ))}
    </LabelCollection>
  )
})

XiaoshanXZZone.displayName = 'ShanghaiWarZone'

export { data }

export default XiaoshanXZZone
