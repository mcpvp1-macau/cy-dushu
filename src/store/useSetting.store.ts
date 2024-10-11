import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

type StateType = {
  virtualReal: {
    roadColor: string
    buildingBackgroundColor: string
    buildingLineColor: string
    roadWidth: number
    buildingWidth: number
    showRoad: boolean
    showSmallRoad: boolean
    showBuilding: boolean
    textColor: string
    textSize: number
    textOutlineColor: string
    textOutlineWidth: number
  }
}

type ActionsType = {
  updateVirtualReal: (data: Partial<StateType['virtualReal']>) => void
}

const useSettingStore = create<StateType & ActionsType>()(
  devtools((set) => ({
    virtualReal: {
      roadColor: '#ffffff',
      buildingBackgroundColor: '#ffffff',
      buildingLineColor: '#ffffff',
      roadWidth: 1,
      buildingWidth: 1,
      showRoad: true,
      showSmallRoad: true,
      showBuilding: true,
      textColor: '#ffffff',
      textSize: 12,
      textOutlineColor: '#ffffff',
      textOutlineWidth: 1,
    },
    updateVirtualReal: (data) => {
      set((state) => ({
        virtualReal: {
          ...state.virtualReal,
          ...data,
        },
      }))
    },
  })),
)
export default useSettingStore
