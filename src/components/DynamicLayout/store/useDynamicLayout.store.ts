import { create } from 'zustand'

type StateType = {
  bounds: Record<string, [number, number, number, number]>
  updateBound: (key: string, bound: [number, number, number, number]) => void
  updateBounds: (
    bounds: Record<string, [number, number, number, number]>,
  ) => void
}

const useDynamicLayoutStore = create<StateType>()((set, get) => ({
  bounds: {},
  updateBound: (key, bound) => {
    set({ bounds: { ...get().bounds, [key]: bound } }, false)
  },
  updateBounds: (bounds) => {
    set({ bounds }, false)
  },
}))

export default useDynamicLayoutStore
