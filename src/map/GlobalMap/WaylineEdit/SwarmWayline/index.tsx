import useSwarmWaylineStore from '@/store/wayline/uav-swarm-wayline/useSwarmWayline.store'
import useMouseStyle from './useMouseStyle'
import DrawPolygon from '../AreaWayline/components/DrawPolygon'
import EditablePolygon from '../AreaWayline/components/EditablePolygon'

const SwarmWayline: FC<unknown> = memo(() => {
  useMouseStyle()

  // 是否已经绘制了多边形
  const polygon = useSwarmWaylineStore((s) => s.templateConfig.polygon)

  const updateTemplateConfig = useSwarmWaylineStore(
    (s) => s.updateTemplateConfig,
  )

  const handlePolygonChange = (polygon: number[][]) => {
    updateTemplateConfig({
      polygon,
    })
  }

  return (
    <>
      {(!polygon || polygon.length === 0) && (
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
    </>
  )
})

SwarmWayline.displayName = 'SwarmWayline'

export default SwarmWayline
