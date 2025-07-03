import IconDelete from '@/assets/icons/jsx/IconDelete'
import IconVisible from '@/assets/icons/jsx/IconVisible'
import IconNotVisible from '@/assets/icons/jsx/IconNotVisible'
import AppCollapse from '@/components/AppCollapse'
import AppEmpty from '@/components/AppEmpty'
import IconButton from '@/components/ui/button/IconButton'
import { groupBy } from 'lodash'
import { useAppMsg } from '@/hooks/useAppMsg'
import useFlightAreaStore from '@/store/map/useFlightArea.store'
import FlightAreaItemConfig from './FlightAreaConfig'
import EditFlightAreaGroup from './EditFlightAreaGroup'
import { deleteFlightAreaGroup } from '@/service/modules/flightArea'

type PropsType = {
  searchKw?: string
  searchType?: string
}

/** 飞行区域分组列表 */
const FlightAreaGroupConfig: FC<PropsType> = memo((props) => {
  const { t } = useTranslation()

  const flightAreaGroupList = useFlightAreaStore((s) => s.flightAreaGroupList)
  const flightAreaList = useFlightAreaStore((s) => s.flightAreaList)

  const defaultExpandLayerIds = useMemo(() => {
    return flightAreaGroupList
      .filter((e) => e.layerType === 'DEFAULT')
      .map((e) => e.layerId)
  }, [flightAreaList])

  /**分组后的flightAreaList */
  const flightListGroup = useMemo(() => {
    const grouped = groupBy(flightAreaList, 'layerId')
    for (const key in grouped) {
      grouped[key] = grouped[key].filter(
        (e) =>
          e.overlayName.includes(props.searchKw ?? '') &&
          (!props.searchType || e.overlayExtType === props.searchType),
      )
    }
    return grouped
  }, [flightAreaList, props.searchKw, props.searchType])

  const msgApi = useAppMsg()
  const queryClient = useQueryClient()
  const handleDelGroup = async (id: number) => {
    await deleteFlightAreaGroup(id)
    await queryClient.invalidateQueries({
      queryKey: ['getFlightAreaGroupList'],
    })
    msgApi.success(t('api.success.msg'))
  }

  return (
    <>
      <AppCollapse
        defaultActiveKey={defaultExpandLayerIds}
        accordion
        items={flightAreaGroupList.map((layerGroup) => ({
          key: layerGroup.layerId,
          label: ` - ${layerGroup.layerName}`,
          extra: (
            <div className="flex gap-3" onClick={(e) => e.stopPropagation()}>
              {/* <IconButton
                onClick={() => {
                  	// updateShow(layerGroup.id, !showGroupIds.has(layerGroup.id))
                }}
              >
                {showGroupIds.has(layerGroup.id) ? (
                  <IconVisible />
                ) : (
                  <IconNotVisible />
                )}
              </IconButton> */}

              <EditFlightAreaGroup data={layerGroup} />

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
            <ul className="p-3 flex flex-col gap-2 max-h-[300px] overflow-y-auto">
              {(flightListGroup[layerGroup.layerId] ?? []).length === 0 ? (
                <AppEmpty />
              ) : (
                (flightListGroup[layerGroup.layerId] ?? []).map((e) => (
                  <FlightAreaItemConfig key={e.overlayId} data={e} />
                ))
              )}
            </ul>
          ),
        }))}
      />
    </>
  )
})

FlightAreaGroupConfig.displayName = 'FlightAreaListConfig'

export default FlightAreaGroupConfig
