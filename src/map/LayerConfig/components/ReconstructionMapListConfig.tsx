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
import { useAppMsg } from '@/hooks/useAppMsg'
import { deleteLayerGroupList } from '@/service/modules/reconstruction'

const ReconstructionMapListConfig: FC = memo(() => {
  const { t } = useTranslation()

  const layerGroupList = useReconstructionMap((s) => s.layerGroupList)
  const layerList = useReconstructionMap((s) => s.layerList)

  const defaultExpandLayerIds = useMemo(() => {
    return layerGroupList
      .filter((e) => e.layerType === 'DEFAULT')
      .map((e) => e.id)
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
    await deleteLayerGroupList(id)
    await queryClient.invalidateQueries({
      queryKey: ['reconstruction-groupList'],
    })
    msgApi.success(t('api.success.msg'))
  }

  return (
    <AppCollapse
      defaultActiveKey={defaultExpandLayerIds}
      accordion
      items={layerGroupList.map((layerGroup) => ({
        key: layerGroup.id,
        label: ` - ${layerGroup.layerName}`,
        extra: (
          <div className="flex gap-3" onClick={(e) => e.stopPropagation()}>
            <IconButton
              onClick={() => {
                if (hiddenGroupIds.has(layerGroup.id)) {
                  hiddenGroupIds.delete(layerGroup.id)
                } else {
                  hiddenGroupIds.add(layerGroup.id)
                }
                updateHiddenGroupIds(new Set(hiddenGroupIds))
              }}
            >
              {hiddenGroupIds.has(layerGroup.id) ? (
                <IconNotVisible />
              ) : (
                <IconVisible />
              )}
            </IconButton>
            {layerGroup.layerType !== 'DEFAULT' && (
              <IconButton
                className="scale-90"
                onClick={() => handleDelGroup(layerGroup.id)}
              >
                <IconDelete />
              </IconButton>
            )}
          </div>
        ),
        children: (
          <ul className="p-3 flex flex-col gap-2">
            {(layerListGroup[layerGroup.id] ?? []).length === 0 ? (
              <AppEmpty />
            ) : (
              (layerListGroup[layerGroup.id] ?? []).map((e) => (
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
