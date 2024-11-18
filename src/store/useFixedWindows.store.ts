import { v4 } from 'uuid'
import { create } from 'zustand'

export type WindowType = {
  id: string
  zIndex: number
  allowScale?: boolean
  layout: {
    x: number
    y: number
    width: number
    height: number
  }
} & {
  type: 'live-video'
  productKey: string
  deviceId: string
  videoId: string
}

type StateType = {
  windows: WindowType[]
  maxZIndex: number
  activeWindowId: string | null
}

type ActionsType = {
  addWindow: (
    window: Omit<WindowType, 'id' | 'zIndex' | 'layout'> & {
      layout?: Partial<WindowType['layout']>
    },
  ) => void
  removeWindow: (id: string) => void
  updateWindow: (id: string, window: Partial<WindowType>) => void
  updateActiveWindow: (id: string) => void
}

/** 窗口 */
const useFixedWindowsStore = create<StateType & ActionsType>()((set, get) => ({
  windows: [],
  maxZIndex: 0,
  activeWindowId: null,
  addWindow: (e) => {
    const newItem = {
      ...e,
      id: v4(),
      zIndex: get().maxZIndex + 1,
      layout: {
        x: 0,
        y: 0,
        width: 400,
        height: 300,
        ...(e.layout ?? {}),
      } as WindowType['layout'],
    }
    set((state) => ({
      windows: [...state.windows, newItem],
    }))
  },
  updateWindow: (id, window) => {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, ...window } : w,
      ),
    }))
  },
  removeWindow: (id) => {
    set((state) => ({ windows: state.windows.filter((w) => w.id !== id) }))
  },
  updateActiveWindow: (id) => set({ activeWindowId: id }),
}))

export default useFixedWindowsStore
