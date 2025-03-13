import IconDelete from '@/assets/icons/jsx/IconDelete'
import IconVisible from '@/assets/icons/jsx/IconVisible'
import AppCollapse from '@/components/AppCollapse'
import AppEmpty from '@/components/AppEmpty'
import IconButton from '@/components/ui/button/IconButton'
import useReconstructionMap, {
  useReconstructionMapConfigStore,
} from '@/store/map/useReconstructionMap.store'
import { groupBy } from 'lodash'
import ReconstructionMapConfig from './ReconstructionMapConfig'
import IconNotVisible from '@/assets/icons/jsx/IconNotVisible'
import { delLayer } from '@/service/modules/layer_overlay'
import { useAppMsg } from '@/hooks/useAppMsg'

type PropsType = unknown

const ReconstructionMapListConfig: FC = memo(() => {
  const layerGroupList = useReconstructionMap((s) => s.layerGroupList)
  const layerList = useReconstructionMap((s) => s.layerList)

  const defaultExpandLayerIds = useMemo(() => {
    return layerGroupList
      .filter((e) => e.layerType === 'DEFAULT')
      .map((e) => e.layerId)
  }, [layerList])

  /**分组后的layerList */
  const layerListGroup = useMemo(
    () => groupBy(layerList, 'layerId'),
    [layerList],
  )

  const hiddenGroupIds = useReconstructionMapConfigStore(
    (s) => s.hiddenGroupIds,
  )
  const updateHiddenGroupIds = useReconstructionMapConfigStore(
    (s) => s.updateHiddenGroupIds,
  )

  const msgApi = useAppMsg()
  const queryClient = useQueryClient()
  const handleDelGroup = async (id: number) => {
    msgApi.info(`删除id为${id}的三维图层组`)
  }

  return (
    <AppCollapse
      defaultActiveKey={defaultExpandLayerIds}
      accordion
      items={layerGroupList.map((layerGroup) => ({
        key: layerGroup.layerId,
        label: ` - ${layerGroup.layerName}`,
        extra: (
          <div className="flex gap-3" onClick={(e) => e.stopPropagation()}>
            <IconButton
              onClick={() => {
                if (hiddenGroupIds.has(layerGroup.layerId)) {
                  hiddenGroupIds.delete(layerGroup.layerId)
                } else {
                  hiddenGroupIds.add(layerGroup.layerId)
                }
                updateHiddenGroupIds(new Set(hiddenGroupIds))
              }}
            >
              {hiddenGroupIds.has(layerGroup.layerId) ? (
                <IconNotVisible />
              ) : (
                <IconVisible />
              )}
            </IconButton>
            {layerGroup.layerType !== 'DEFAULT' && (
              <IconButton
                className="scale-90"
                onClick={() => handleDelGroup(layerGroup.layerId)}
              >
                <IconDelete />
              </IconButton>
            )}
          </div>
        ),
        children: (
          <ul className="p-3 flex flex-col gap-2">
            {(layerListGroup[layerGroup.layerId] ?? []).length === 0 ? (
              <AppEmpty />
            ) : (
              (layerListGroup[layerGroup.layerId] ?? []).map((e) => (
                <ReconstructionMapConfig key={e.overlayId} data={e} />
              ))
            )}
          </ul>
        ),
      }))}
    />
  )
})

ReconstructionMapListConfig.displayName = 'ReconstructionMapListConfig'

export default ReconstructionMapListConfig
