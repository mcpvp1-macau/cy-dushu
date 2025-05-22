import { create } from 'zustand'

type StateType = {
  mediaGroup: Record<string, API_DBAPI.domain.PlatformCaptureRecord[]>
}

type ActionsType = {
  updateMediaGroup: (mediaGroup: StateType['mediaGroup']) => void
}

/** 媒体上图 */
const useMediaOnMapStore = create<StateType & ActionsType>()((set) => ({
  mediaGroup: {},
  updateMediaGroup: (mediaGroup) => set({ mediaGroup }),
}))

export default useMediaOnMapStore
