import IconDelete from '@/assets/icons/jsx/IconDelete'
import IconVisible from '@/assets/icons/jsx/IconVisible'
import AppCollapse from '@/components/AppCollapse'
import AppEmpty from '@/components/AppEmpty'
import IconButton from '@/components/ui/button/IconButton'
import useMapLayerAndOverlayStore from '@/store/map/useLayerAndOverlay.store'
import { groupBy } from 'lodash'
import MapOverlayConfig from './MapOverlayConfig'
import IconNotVisible from '@/assets/icons/jsx/IconNotVisible'

type PropsType = unknown

const MapLayerListConfig: FC<PropsType> = memo(() => {
  const layerList = useMapLayerAndOverlayStore((s) => s.layerList)
  const overlayList = useMapLayerAndOverlayStore((s) => s.overlayList)

  const defaultExpandLayerIds = useMemo(() => {
    return layerList
      .filter((e) => e.layerType === 'DEFAULT')
      .map((e) => e.layerId)
  }, [layerList])

  const overlayGroup = useMemo(
    () => groupBy(overlayList, 'layerId'),
    [overlayList],
  )

  const hiddenLayerIds = useMapLayerAndOverlayStore((s) => s.hiddenLayerIds)
  const updateHiddenLayerIds = useMapLayerAndOverlayStore(
    (s) => s.updateHiddenLayerIds,
  )

  return (
    <AppCollapse
      defaultActiveKey={defaultExpandLayerIds}
      accordion
      items={layerList.map((e) => ({
        key: e.layerId,
        label: ` - ${e.layerName}`,
        extra: (
          <div className="flex gap-3" onClick={(e) => e.stopPropagation()}>
            <IconButton
              onClick={() => {
                if (hiddenLayerIds.has(e.layerId)) {
                  hiddenLayerIds.delete(e.layerId)
                } else {
                  hiddenLayerIds.add(e.layerId)
                }
                updateHiddenLayerIds(new Set(hiddenLayerIds))
              }}
            >
              {hiddenLayerIds.has(e.layerId) ? (
                <IconNotVisible />
              ) : (
                <IconVisible />
              )}
            </IconButton>
            {'DEFAULT' !== e.layerType && (
              <IconButton className="scale-90">
                <IconDelete />
              </IconButton>
            )}
          </div>
        ),
        children: (
          <ul className="p-3 flex flex-col gap-2">
            {(overlayGroup[e.layerId] ?? []).length === 0 ? (
              <AppEmpty />
            ) : (
              (overlayGroup[e.layerId] ?? []).map((e) => (
                <MapOverlayConfig key={e.overlayId} data={e} />
              ))
            )}
          </ul>
        ),
      }))}
    />
  )
})

MapLayerListConfig.displayName = 'MapLayerConfig'

export default MapLayerListConfig
