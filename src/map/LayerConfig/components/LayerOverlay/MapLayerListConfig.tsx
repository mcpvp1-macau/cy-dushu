import IconDelete from '@/assets/icons/jsx/IconDelete'
import IconVisible from '@/assets/icons/jsx/IconVisible'
import AppCollapse from '@/components/AppCollapse'
import AppEmpty from '@/components/AppEmpty'
import IconButton from '@/components/ui/button/IconButton'
import useMapLayerAndOverlayStore, {
  useMapLayerAndOverlayConfigStore,
} from '@/store/map/useLayerAndOverlay.store'
import { groupBy } from 'lodash'
import MapOverlayConfig from './MapOverlayConfig'
import IconNotVisible from '@/assets/icons/jsx/IconNotVisible'
import { delLayer } from '@/service/modules/layer_overlay'
import { useAppMsg } from '@/hooks/useAppMsg'

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

  const hiddenOverlayIds = useMapLayerAndOverlayConfigStore(
    (s) => s.hiddenOverlayIds,
  )

  const hiddenLayerIds = useMemo(() => {
    const hiddenLayerIds = new Set<number>()
    layerList.forEach((e) => {
      if (
        overlayGroup[e.layerId]?.every((o) => hiddenOverlayIds.has(o.overlayId))
      ) {
        hiddenLayerIds.add(e.layerId)
      }
    })
    return hiddenLayerIds
  }, [layerList, overlayGroup, hiddenOverlayIds])

  const msgApi = useAppMsg()
  const queryClient = useQueryClient()
  const handleDelLayer = async (layerId: number) => {
    await delLayer(layerId)
    msgApi.success('删除成功')
    await queryClient.invalidateQueries({
      queryKey: ['layerList'],
    })
  }

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
                const newHiddenOverlayIds = new Set(hiddenOverlayIds)
                if (hiddenLayerIds.has(e.layerId)) {
                  overlayGroup[e.layerId]?.forEach((o) => {
                    newHiddenOverlayIds.delete(o.overlayId)
                  })
                } else {
                  overlayGroup[e.layerId]?.forEach((o) => {
                    newHiddenOverlayIds.add(o.overlayId)
                  })
                }
                useMapLayerAndOverlayConfigStore.setState({
                  hiddenOverlayIds: newHiddenOverlayIds,
                })
              }}
            >
              {hiddenLayerIds.has(e.layerId) ? (
                <IconNotVisible />
              ) : (
                <IconVisible />
              )}
            </IconButton>
            {'DEFAULT' !== e.layerType && (
              <IconButton
                className="scale-90"
                onClick={() => handleDelLayer(e.layerId)}
              >
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
