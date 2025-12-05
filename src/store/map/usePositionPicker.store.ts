import { create } from 'zustand'

type StateType = {
  /** 是否正在选点模式 */
  isPicking: boolean
  /** 选中的经度 */
  longitude: number | null
  /** 选中的纬度 */
  latitude: number | null
  /** 选点回调（由调用方设置） */
  onPick: ((lng: number, lat: number) => void) | null
}

type ActionsType = {
  /** 开始选点 */
  startPicking: (callback: (lng: number, lat: number) => void) => void
  /** 结束选点 */
  stopPicking: () => void
  /** 设置选中的位置 */
  setPosition: (lng: number, lat: number) => void
}

const usePositionPickerStore = create<StateType & ActionsType>()((set, get) => ({
  isPicking: false,
  longitude: null,
  latitude: null,
  onPick: null,

  startPicking: (callback) =>
    set({
      isPicking: true,
      onPick: callback,
    }),

  stopPicking: () =>
    set({
      isPicking: false,
      longitude: null,
      latitude: null,
      onPick: null,
    }),

  setPosition: (lng, lat) => {
    const { onPick } = get()
    set({ longitude: lng, latitude: lat })
    if (onPick) {
      onPick(lng, lat)
    }
    // 自动退出选点模式
    set({
      isPicking: false,
      onPick: null,
    })
  },
}))

export default usePositionPickerStore
