import { createContext, ReactNode } from 'react'
import { createStore, useStore } from 'zustand'

type StateType = {
  bounds: Record<string, [number, number, number, number]>
  iconMap: Record<string, ReactNode>
  titleMap: Record<string, ReactNode>
  updateBound: (key: string, bound: [number, number, number, number]) => void
  updateBounds: (
    bounds: Record<string, [number, number, number, number]>,
  ) => void
  updateMergeBounds: (
    bounds: Record<string, [number, number, number, number]>,
  ) => void
  updateTitleMap: (titleMap: Record<string, ReactNode>) => void
  updateIconMap: (iconMap: Record<string, ReactNode>) => void
}

export const createDynamicLayoutStore = () => {
  return createStore<StateType>((set, get) => ({
    bounds: {},
    iconMap: {},
    titleMap: {},
    updateBound: (key, bound) => {
      set({ bounds: { ...get().bounds, [key]: bound } }, false)
    },
    updateBounds: (bounds) => {
      set({ bounds }, false)
    },
    updateMergeBounds: (bounds) => {
      set({ bounds: { ...get().bounds, ...bounds } }, false)
    },
    updateTitleMap: (titleMap) => {
      set({ titleMap }, false)
    },
    updateIconMap: (iconMap) => {
      set({ iconMap }, false)
    },
  }))
}

export type DynamicLayoutStore = ReturnType<typeof createDynamicLayoutStore>

export const DynamicLayoutStoreContext =
  createContext<DynamicLayoutStore | null>(null)

export const useDynamicLayoutStore = <T>(select: (state: StateType) => T) => {
  const store = useContext(DynamicLayoutStoreContext)!
  return useStore(store, select)
}

export default useDynamicLayoutStore
