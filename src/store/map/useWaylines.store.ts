import { create } from 'zustand'

export type Wayline = {
  id: string
  type: string
  points: { pointX: number; pointY: number; pointZ: number }[]
}

type StateType = {
  waylines: Wayline[]
}

type ActionsType = {
  updateWaylines: (waylines: StateType['waylines']) => void
}

const useWaylinesStore = create<StateType & ActionsType>()((set) => ({
  waylines: [],
  updateWaylines: (waylines) => set({ waylines }),
}))

export default useWaylinesStore
