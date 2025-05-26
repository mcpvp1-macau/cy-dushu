import _data from './warzone_data.json'
import GroundPolygon from '../service/common/GroundPolygon'
import { Label, LabelCollection, useCesium } from 'resium'
import { Fragment } from 'react/jsx-runtime'
import * as Cesium from 'cesium'
import { bbox, center } from '@turf/turf'
import useShanghaiWarZoneStore from '@/store/map/useShanghaiWarZone.store'
import mitt from 'mitt'

const data = _data as GeoJSON.FeatureCollection<GeoJSON.Polygon>

let i = 0
for (const e of data.features) {
  e.properties!.id = i++
}

export const warZoneCallSigns = new Set([
  '达114警航02',
  '新115警航03',
  '新115警航05',
  '昆117警航01',
  '方118警航01',
  '方118警航02',
  '方118警航03',
  '江120警航01',
  '江120警航02',
  '江120警航03',
  '绣121警航01',
  '绣121警航02',
  '绣121警航03',
  '岳123警航01',
  '岳123警航02',
  '岳123警航03',
  '滇124警航01',
  '滇124警航02',
  '滇124警航03',
  '宁126警航04',
  '川125警航01',
  '川125警航02',
  '川125警航06',
  '中127警航01',
  '中127警航06',
  '中127警航07',
  '剑130警航01',
  '河129警航01',
  '河129警航02',
  '泰132警航08',
  '汉133警航02',
  '汉133警航03',
  '汉133警航04',
  '汉133警航07',
  '汉133警航08',
  '汉133警航10',
  '汉133警航11',
  '汉133警航12',
  '汉133警航13',
  '汉133警航14',
  '汉133警航15',
  '汉133警航16',
  '汉133警航17',
  '汉133警航18',
  '汉133警航19',
  '汉133警航20',
  '汉133警航21',
  '汉133警航22',
  '汉133警航23',
  '汉133警航25',
  '汉133警航28',
  '图134警航01',
  '化147警航01',
  '农场1号战区',
  '农场2号战区',
  '农场3号战区',
  '农场4号战区',
  '农场5号战区',
  '农场6号战区',
  '农场7号战区',
  '农场8号战区',
  '农场9号战区',
  '农场10号战区',
  '农场11号战区',
  '农场12号战区',
  '农场13号战区',
  '农场14号战区',
])

type PropsType = unknown

export const shanghaiWarZoneEmitter = mitt<{
  fitZone: number
}>()

const ShanghaiWarZone: FC<PropsType> = memo(() => {
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

  const hiddenZones = useShanghaiWarZoneStore((s) => s.hiddenZones)

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
    shanghaiWarZoneEmitter.on('fitZone', flyFn)
    return () => {
      shanghaiWarZoneEmitter.off('fitZone', flyFn)
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
              outlineColor={
                warZoneCallSigns.has(e.properties!.name)
                  ? '#FFB36666'
                  : '#FEF9CD66'
              }
              fillColor={
                warZoneCallSigns.has(e.properties!.name)
                  ? '#FFB3663f'
                  : '#FEF9CD3f'
              }
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

ShanghaiWarZone.displayName = 'ShanghaiWarZone'

export { data }

export default ShanghaiWarZone
