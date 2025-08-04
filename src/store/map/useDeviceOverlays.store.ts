import { create } from 'zustand'

type StateType = {
  deviceOverlays: Record<string, API_DEVICE_OVERLAY.domain.Overlay[]>
}

type ActionsType = {
  updateDeviceOverlays: (overlays: StateType['deviceOverlays']) => void
}

const useDeviceOverlaiesStore = create<StateType & ActionsType>()((set) => ({
  deviceOverlays: {},
  updateDeviceOverlays: (overlays) => set(() => ({ deviceOverlays: overlays })),
}))

export default useDeviceOverlaiesStore
