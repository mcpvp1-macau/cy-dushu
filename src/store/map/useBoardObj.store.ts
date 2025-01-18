import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

type StateType = {
  boardObj: any
  boardOpenMap: any
}

type ActionsType = {
  setBoardObj: (boardObj: StateType['boardObj']) => void
  setBoardOpenMap: (boardOpenMap: StateType['boardOpenMap']) => void
}

const useBoardObjStore = create<StateType & ActionsType>()(
  devtools(
    (set, get) => ({
      boardObj: {},
      boardOpenMap: {},
      setBoardObj: (boardObj) => {
        set({ boardObj }, false, 'setBoardObj')
      },
      setBoardOpenMap: (boardOpenMap) => {
        if (typeof boardOpenMap === 'function') {
          const map = boardOpenMap(get().boardOpenMap)
          set({ boardOpenMap: map }, false, 'setBoardOpenMap')
        } else {
          set({ boardOpenMap }, false, 'setBoardOpenMap')
        }
      },
    }),
    {
      name: 'board-obj-store',
      enabled: import.meta.env.DEV,
    },
  ),
)

export default useBoardObjStore
