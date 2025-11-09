import { RightModeEnum, RightOuterEnum } from '@/enum/right-mode'
import { create } from 'zustand'
import { devtools, persist, createJSONStorage } from 'zustand/middleware'

type StateType = {
  rightMode: RightModeEnum | null
  detailId: string | null

  rightOuterMode: RightOuterEnum | null
  rightOuterDetailId: string | null
}

type ActionsType = {
  updateRightMode: (rightMode: StateType['rightMode']) => void
  updateDetailId: (detailId: StateType['detailId']) => void
  updateRightOuterMode: (rightOuterMode: StateType['rightOuterMode']) => void
  updateRightOuterDetailId: (
    rightOuterDetailId: StateType['rightOuterDetailId'],
  ) => void
}

/** 右侧详情 */
const useRightMode = create<StateType & ActionsType>()(
  devtools(
    persist(
      (set) => ({
        rightMode: RightModeEnum.HIDE,
        detailId: null,
        rightOuterMode: null,
        rightOuterDetailId: null,
        updateRightMode: (rightMode) => {
          set({ rightMode }, false, 'updateRightMode')
        },
        updateDetailId: (detailId) => {
          set({ detailId }, false, 'updateDetailId')
        },
        updateRightOuterMode: (rightOuterMode) => {
          set({ rightOuterMode }, false, 'updateRightOuterMode')
        },
        updateRightOuterDetailId: (rightOuterDetailId) => {
          set({ rightOuterDetailId }, false, 'updateRightOuterDetailId')
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
