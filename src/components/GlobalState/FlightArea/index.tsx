import useFlightAreaStore from '@/store/map/useFlightArea.store'
import { getFlightAreaGroupList } from '@/service/modules/flightArea'
import FlightAreaList from './FlightAreaList'

type PropsType = unknown

const FlightArea: FC<PropsType> = memo(() => {
  const queryClient = useQueryClient()
  const { data } = useQuery(
    {
      queryKey: ['getFlightAreaGroupList'],
      queryFn: () => getFlightAreaGroupList(),
      select: (d) => d.data.rows,
    },
    queryClient,
  )

  useEffect(() => {
    if (!data) {
      return
    }
    useFlightAreaStore.getState().updateFlightAreaGroupList(data)
  })

  return <FlightAreaList />
})

FlightArea.displayName = 'FlightArea'

export default FlightArea
