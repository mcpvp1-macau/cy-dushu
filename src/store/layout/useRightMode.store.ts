import { RightModeEnum } from '@/enum/right-mode'
import { create } from 'zustand'
import { devtools, persist, createJSONStorage } from 'zustand/middleware'

type StateType = {
  rightMode: RightModeEnum | null
  detailId: string | null
}

type ActionsType = {
  updateRightMode: (rightMode: StateType['rightMode']) => void
  updateDetailId: (detailId: StateType['detailId']) => void
}

/** 右侧详情 */
const useRightMode = create<StateType & ActionsType>()(
  devtools(
    persist(
      (set) => ({
        rightMode: RightModeEnum.HIDE,
        detailId: null,
        updateRightMode: (rightMode) => {
          set({ rightMode }, false, 'updateRightMode')
        },
        updateDetailId: (detailId) => {
          set({ detailId }, false, 'updateDetailId')
        },
      }),
      {
        name: 'right-mode',
        storage: createJSONStorage(() => sessionStorage),
      },
    ),
    {
      name: 'right-mode',
      enabled: import.meta.env.DEV,
    },
  ),
)

export default useRightMode
