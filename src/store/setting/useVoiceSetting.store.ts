import { create } from 'zustand'
import { createJSONStorage, devtools, persist } from 'zustand/middleware'

type StateType = {
  enableVoiceSpeech: boolean
}

type ActionsType = {
  updateEnableVoiceSpeech: (data: boolean) => void
}

const useVoiceSettingStore = create<StateType & ActionsType>()(
  devtools(
    persist(
      (set) => ({
        enableVoiceSpeech: false,
        updateEnableVoiceSpeech: (data) => {
          set(
            {
              enableVoiceSpeech: data,
            },
            false,
          )
        },
      }),
      {
        name: 'voice-setting',
        storage: createJSONStorage(() => localStorage),
      },
    ),
    {
      name: 'voice-setting',
      enabled: process.env.NODE_ENV === 'development',
    },
  ),
)
export default useVoiceSettingStore
