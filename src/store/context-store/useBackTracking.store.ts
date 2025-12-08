import { Dayjs } from 'dayjs'
import { createContext } from 'react'
import { createStore, useStore } from 'zustand'
import { devtools } from 'zustand/middleware'

type StateType = {
  currentTime: Dayjs
  timeRange: [Dayjs, Dayjs]
  playing: boolean
  multiple: number
  childActions: API_ACTION_ITEM.domain.ActionItem[]
  /** 当前数据 */
  currentAttribute: any
  /** 设备详情 */
  detail: API_DEVICE.domain.Device | null
}

type ActionsType = {
  updateCurrentTime: (time: Dayjs) => void
  updatePlaying: (playing: boolean) => void
  updateMultiple: (multiple: number) => void
  updateTimeRange: (range: [Dayjs, Dayjs]) => void
  updateChildActions: (actions: API_ACTION_ITEM.domain.ActionItem[]) => void
  updateCurrentAttribute: (attribute: any) => void
  updateDetail: (detail: API_DEVICE.domain.Device | null) => void
  resetState: () => void
}

type CustomerSenderType = {}

const createInitialState = () => ({
    currentTime: dayjs(),
    timeRange: [dayjs().subtract(1, 'days'), dayjs()] as [Dayjs, Dayjs],
    multiple: 1,
} as StateType)

export const createBackTrackingStore = () => {
  return createStore<StateType & ActionsType & CustomerSenderType>()(
    devtools(
      (set, _get) => ({
        ...createInitialState(),
        resetState: () => {
          set(createInitialState(), false, 'resetState')
        },
        updateCurrentTime(time) {
          set({ currentTime: time })
        },
        updatePlaying(playing) {
          set({ playing })
        },
        updateMultiple(multiple) {
          set({ multiple })
        },
        updateTimeRange(range) {
          set({ timeRange: range })
        },
        updateChildActions(actions) {
          set({ childActions: actions })
        },
        updateCurrentAttribute(attribute) {
          set({ currentAttribute: attribute })
        },
        updateDetail(detail) {
          set({ detail })
        },
      }),
      {
        name: 'back-tracking-store',
        enabled: import.meta.env.DEV && false, // 更新频率太高了且数据量大, 不开启了
      },
    ),
  )
}

export type BackTrackingStoreType = ReturnType<typeof createBackTrackingStore>

export const BackTrackingStoreContext =
  createContext<BackTrackingStoreType | null>(null)

export const useBackTrackingStore = <T>(
  select: (state: StateType & ActionsType & CustomerSenderType) => T,
) => {
  const store = useContext(BackTrackingStoreContext)!
  return useStore(store, select)
}

/**
 * 创建回溯 store
 * @returns
 */
export const useCreateBackTrackingStore = () => {
  const storeRef = useRef<BackTrackingStoreType | null>(null)

  if (!storeRef.current) {
    storeRef.current = createBackTrackingStore()
  }

  return storeRef.current
}
