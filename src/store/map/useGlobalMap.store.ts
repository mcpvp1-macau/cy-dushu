import { create } from 'zustand'
import { Viewer } from 'cesium'

type StateType = {
  /** 地图实例 */
  viewer: Viewer | null
}

type ActionsType = {
  /** 更新地图实例 */
  updateViewer: (viewer: Viewer | null) => void
}

const useGlobalMapStore = create<StateType & ActionsType>()((set) => ({
  viewer: null,
  updateViewer: (viewer) => set({ viewer }),
}))

export const useGlobalCesium = () => useGlobalMapStore((s) => s.viewer)

export default useGlobalMapStore
