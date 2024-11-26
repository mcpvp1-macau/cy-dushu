import { create } from 'zustand'

type StateType = {
  timeObj: Record<string, { time: number; [key: string]: any }>
}

type ActionsType = {
  setTimeObj: (timeObj: StateType['timeObj']) => void
  setTimeProp: (id: string, propName: string, value: any) => void
  setTimeProps: (id: string, props: StateType['timeObj'][string]) => void
  resetId: (id: string) => void
  setTime: (id: string, time: number) => void
}

/** 时间轴状态 */
const useTimeStore = create<StateType & ActionsType>()((set) => ({
  timeObj: {},
  setTimeObj: (timeObj) => {
    set({ timeObj })
  },
  setTimeProp: (id, propName, value) => {
    set((state) => {
      const timeObj = { ...state.timeObj }
      timeObj[id] = { ...timeObj[id], [propName]: value }
      return { timeObj }
    })
  },
  setTimeProps: (id, props) => {
    set((state) => {
      const timeObj = { ...state.timeObj }
      timeObj[id] = { ...timeObj[id], ...props }
      return { timeObj }
    })
  },
  resetId: (id) => {
    set((state) => {
      const timeObj = { ...state.timeObj }
      delete timeObj[id]
      return { timeObj }
    })
  },
  setTime: (id, time) => {
    set((state) => {
      const timeObj = { ...state.timeObj }
      timeObj[id] = { ...timeObj[id], time }
      return { timeObj }
    })
  },
}))

export default useTimeStore
