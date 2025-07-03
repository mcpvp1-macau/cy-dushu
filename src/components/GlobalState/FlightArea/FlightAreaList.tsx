import useFlightAreaStore from '@/store/map/useFlightArea.store'
import { useQuery } from '@tanstack/react-query'
import { getFlightAreaList } from '@/service/modules/flightArea'

const FlightAreaList = memo(() => {
  const flightAreaGroupList = useFlightAreaStore((s) => s.flightAreaGroupList)
  const updateFlightAreaList = useFlightAreaStore((s) => s.updateFlightAreaList)

  const queryClient = useQueryClient()

  const { data } = useQuery(
    {
      queryKey: ['getFlightAreaList'],
      queryFn: () =>
        getFlightAreaList({
          layerIds: flightAreaGroupList.map((e) => e.layerId),
        }),
      select: (d) => d.data.rows,
      enabled: flightAreaGroupList.length > 0,
    },
    queryClient,
  )

  if (data) {
    updateFlightAreaList(data)
  }

  return <></>
})

FlightAreaList.displayName = 'FlightAreaList'

export default FlightAreaList
