import useAreaWaylineStore from '@/store/uav/uav-area-wayline/useAreaWayline.store'
import DrawTakeoffRef from './components/DrawTakeoffRef'
import DrawPolygon from './components/DrawPolygon'
import EditablePolygon from './components/EditablePolygon'

import Airpoints from './components/Airpoints'
import { toMercator } from '@turf/turf'
import { calcLongestK } from '@/utils/geometry/polygon'
import useMouseStyle from './useMouseStyle'
import FirstPoint from './components/FirstPoint'

type PropsType = unknown

const AreaWayline: FC<PropsType> = memo(() => {
  const isDrawHome = useAreaWaylineStore((s) => s.isDrawHome)

  // 是否有起飞点
  const takeOffRefPoint = useAreaWaylineStore(
    (s) => s.airlineConfig.takeOffRefPoint,
  )
  // 是否已经绘制了多边形
  const polygon = useAreaWaylineStore((s) => s.templateConfig.polygon)

  const updateTemplateConfig = useAreaWaylineStore(
    (s) => s.updateTemplateConfig,
  )

  const handlePolygonChange = (polygon: number[][]) => {
    let k = 0
    if (polygon.length > 1) {
      const metors = toMercator({
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [polygon],
        },
      })
      k = calcLongestK(
        metors.geometry.coordinates[0] as unknown as [number, number][],
      )
    }
    updateTemplateConfig({
      polygon,
      mainK: k,
    })
  }

  useMouseStyle()

  return (
    <>
      <DrawTakeoffRef />
      {!isDrawHome &&
        !!takeOffRefPoint &&
        (!polygon || polygon.length === 0) && (
          <DrawPolygon showDistance onDrawEnd={handlePolygonChange} />
        )}
      {!!polygon && polygon.length > 0 && (
        <EditablePolygon
          polygon={polygon}
          isEdit
          onPolygonChange={handlePolygonChange}
          onClear={() => handlePolygonChange([])}
        />
      )}
      <Airpoints />
      <FirstPoint />
    </>
  )
})

AreaWayline.displayName = 'AreaWayline'

export default AreaWayline
