import { memo, type FC } from 'react'
import useFlightAreaStore from '@/store/map/useFlightArea.store'
import { getFlightAreaGroupList } from '@/service/modules/flightArea'
import FlightAreaList from './FlightAreaList'

type PropsType = unknown

const FlightArea: FC<PropsType> = memo(() => {
  const updateFlightAreaGroupList = useFlightAreaStore(
    (s) => s.updateFlightAreaGroupList,
  )

  const queryClient = useQueryClient()
  const { data } = useQuery(
    {
      queryKey: ['getFlightAreaGroupList'],
      queryFn: () => getFlightAreaGroupList(),
      select: (d) => d.data.rows,
    },
    queryClient,
  )

  if (data) {
    updateFlightAreaGroupList(data)
  }

  return <FlightAreaList />
})

FlightArea.displayName = 'FlightArea'

export default FlightArea
