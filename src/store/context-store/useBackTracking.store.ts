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
  /** 选中的轨迹 ID，空值表示不过滤 */
  selectedTrackId: string | null
  /** 需要时间轴移动到的时间点 */
  moveToTime: Dayjs | null
}

type ActionsType = {
  updateCurrentTime: (time: Dayjs) => void
  updatePlaying: (playing: boolean) => void
  updateMultiple: (multiple: number) => void
  updateTimeRange: (range: [Dayjs, Dayjs]) => void
  updateChildActions: (actions: API_ACTION_ITEM.domain.ActionItem[]) => void
  updateCurrentAttribute: (attribute: any) => void
  updateDetail: (detail: API_DEVICE.domain.Device | null) => void
  updateSelectedTrackId: (trackId: string | null) => void
  updateMoveToTime: (time: Dayjs | null) => void
  resetState: () => void
}

type CustomerSenderType = Record<string, any>

const createInitialState = () =>
  ({
    currentTime: dayjs(),
    timeRange: [dayjs().subtract(1, 'days'), dayjs()] as [Dayjs, Dayjs],
    playing: false,
    multiple: 1,
    childActions: [],
    currentAttribute: {},
    detail: null,
    selectedTrackId: null,
    moveToTime: null,
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
        updateSelectedTrackId(trackId) {
          set({ selectedTrackId: trackId })
        },
        updateMoveToTime(time) {
          set({ moveToTime: time })
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
