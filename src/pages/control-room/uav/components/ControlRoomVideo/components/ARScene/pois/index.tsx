import useMixARStore from '@/store/control-room/useMixAR.store'
import { wgs84ToDrawingBufferCoordinates } from '@/utils/cesium/sence-transform'
import * as Cesium from 'cesium'
import { getPOIIcon } from './icon-map'
import useARSettingStore from '@/store/setting/useARSetting.store'

type PropsType = unknown

type Item = {
  id: React.Key
  properties: GeoJSON.GeoJsonProperties
  coordinates: number[]
}

const ARScenePOIs: FC<PropsType> = memo(() => {
  const pois = useMixARStore((s) => s.pois)
  const viewer = useMixARStore((s) => s.cesiumViewer)
  const uav = useMixARStore((s) => s.uavProperties)

  const poiSetting = useARSettingStore((s) => s.poi)
  const overlaySetting = useARSettingStore((s) => s.overlay)
  const overlaies = useMixARStore((s) => s.overlaies)

  const filterSet = useMemo(
    () => new Set(poiSetting.filter),
    [poiSetting.filter],
  )

  const items = useMemo(() => {
    if (!viewer?.scene || !pois || !poiSetting.enable) {
      return []
    }

    const poiItems: Item[] = []

    for (const feature of pois.features) {
      if (filterSet.size && !filterSet.has(feature.properties?.bigType)) {
        continue
      }
      const coordinates = feature.geometry.coordinates
      const catesian = Cesium.Cartesian3.fromDegrees(
        coordinates[0],
        coordinates[1],
        coordinates[2] ?? 0,
      )
      // 获取屏幕坐标
      const screenPostion = wgs84ToDrawingBufferCoordinates(
        viewer.scene,
        catesian,
      )
      if (!screenPostion) {
        continue
      }
      poiItems.push({
        id: feature.id as React.Key,
        properties: feature.properties,
        coordinates: [
          screenPostion.x / viewer.resolutionScale,
          screenPostion.y / viewer.resolutionScale,
        ],
      })
    }

    return poiItems
  }, [pois, viewer, uav, filterSet])

  const overlayPoints = useMemo(() => {
    if (
      !overlaies?.features ||
      !viewer ||
      !overlaySetting.enable ||
      !overlaySetting.point
    ) {
      return []
    }

    const poi: Item[] = []

    for (const feature of overlaies.features) {
      if (feature.geometry.type === 'Point') {
        const coordinates = feature.geometry.coordinates
        const catesian = Cesium.Cartesian3.fromDegrees(
          coordinates[0],
          coordinates[1],
          coordinates[2] ?? 0,
        )
        // 获取屏幕坐标
        const screenPostion = wgs84ToDrawingBufferCoordinates(
          viewer.scene,
          catesian,
        )
        if (!screenPostion) {
          continue
        }
        poi.push({
          id: feature.id as React.Key,
          properties: feature.properties,
          coordinates: [
            screenPostion.x / viewer.resolutionScale,
            screenPostion.y / viewer.resolutionScale,
          ],
        })
      }
    }

    return poi
  }, [overlaies])

  return (
    <div className="absolute inset-0 z-[60] overflow-hidden pointer-events-auto">
      {[...items, ...overlayPoints].map((item) => {
        return (
          <div
            key={item.id}
            className="absolute -translate-x-1/2 -translate-y-full flex flex-col items-center group cursor-pointer"
            style={{ left: item.coordinates[0], top: item.coordinates[1] }}
          >
            <img
              className="size-4"
              src={getPOIIcon([
                item.properties?.midType,
                item.properties?.bigType,
              ])}
            />
            {
              <p
                className={clsx(
                  'mt-1 absolute -bottom-1 translate-y-full text-xs shadow-sm whitespace-nowrap text-white scale-90',
                  poiSetting.showName ? 'block' : 'hidden group-hover:block',
                )}
                style={{
                  textShadow: '0 0 2px #000',
                }}
              >
                {item.properties?.name}
              </p>
            }
          </div>
        )
      })}
    </div>
  )
})

ARScenePOIs.displayName = 'ARScenePOIs'

export default ARScenePOIs
