import { create } from 'zustand'

export type Track = {
  id: string
  useCallback?: boolean
  path: {
    lon: number
    lat: number
  }[]
}

type StateType = {
  tracks: Track[]
  trackMaps: Map<string, Track>
}

type ActionsType = {
  updateTracks: (tracks: StateType['tracks']) => void
  updateTrackMaps: (trackMaps: StateType['trackMaps']) => void
}

/** 历史轨迹 store */
const useHistoryTrackStore = create<StateType & ActionsType>()((set) => ({
  tracks: [],
  trackMaps: new Map(),
  updateTracks: (tracks) => {
    set({ tracks })
  },
  updateTrackMaps: (trackMaps) => {
    set({ trackMaps })
  },
}))

export default useHistoryTrackStore
