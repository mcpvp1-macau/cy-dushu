import { getEventList } from '@/service/modules/events'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

type StateType = {
  allEvents: API_EVENTS.domain.Event[]
}

type ActionsType = {
  updateAllEvents: (allEvents: StateType['allEvents']) => void
}

/** 态势事件、地图打点 */
const useEventStore = create<StateType & ActionsType>()(
  devtools((set) => ({
    allEvents: [],
    updateAllEvents: (allEvents) => {
      set({ allEvents })
    },
  })),
)

export const useEventData = () => {
  const queryClient = useQueryClient()
  const updateAllEvents = useEventStore((s) => s.updateAllEvents)
  const { data, refetch } = useQuery(
    {
      queryKey: ['getEventList'],
      queryFn: async () => {
        const { data } = await getEventList({
          processStatusList: ['PENDING', 'PROCESSING'],
          isPage: false,
        })
        updateAllEvents(data.rows)
        return data.rows
      },
    },
    queryClient,
  )
  return { data, refetch }
}

export default useEventStore
