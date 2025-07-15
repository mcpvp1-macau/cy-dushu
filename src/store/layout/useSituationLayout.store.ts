import { create } from 'zustand'

type StateType = {
  collapsedOpen: boolean
}

type ActionsType = {
  updateCollapsedOpen: (collapsedOpen: boolean) => void
}

/** 态势页布局状态 */
const useSituationLayoutStore = create<StateType & ActionsType>()((set) => ({
  collapsedOpen: false,
  updateCollapsedOpen: (collapsedOpen) =>
    set(() => ({
      collapsedOpen,
    })),
}))

export default useSituationLayoutStore
