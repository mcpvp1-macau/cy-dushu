import { create } from 'zustand'
import { devtools, persist, createJSONStorage } from 'zustand/middleware'

type StateType = {
  videoEncoderValue: string
}

type ActionsType = {
  setVideoEncoderValue: (
    videoEncoderValue: StateType['videoEncoderValue'],
  ) => void
}

/** 右侧详情 */
const useVideoEncoderStore = create<StateType & ActionsType>()(
  devtools(
    persist(
      (set) => ({
        videoEncoderValue: '',
        setVideoEncoderValue: (videoEncoderValue) => {
          set({ videoEncoderValue }, false, 'setVideoEncoderValue')
        },
      }),
      {
        name: 'video-encoder',
        storage: createJSONStorage(() => sessionStorage),
      },
    ),
    {
      name: 'video-encoder',
      enabled: import.meta.env.DEV,
    },
  ),
)

export default useVideoEncoderStore
