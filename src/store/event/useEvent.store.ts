import { getEventList } from '@/service/modules/events'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

type StateType = {
  allEvents: API_EVENTS.domain.Event[]
  swiperEvents: API_EVENTS.domain.Event[]
  detailEventId: string | null | undefined
}

type ActionsType = {
  updateAllEvents: (allEvents: StateType['allEvents']) => void
  updateSwiperEvents: (swiperEvents: StateType['swiperEvents']) => void
  updateDetailEventId: (detailEventId: StateType['detailEventId']) => void
}

/** 态势事件、地图打点 */
const useEventStore = create<StateType & ActionsType>()(
  devtools((set) => ({
    allEvents: [],
    swiperEvents: [],
    detailEventId: null,
    updateAllEvents: (allEvents) => {
      set({ allEvents })
    },
    updateSwiperEvents: (swiperEvents) => {
      set({ swiperEvents })
    },
    updateDetailEventId: (detailEventId) => {
      set({ detailEventId })
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
