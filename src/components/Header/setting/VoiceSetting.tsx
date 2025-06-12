import useVoiceSettingStore from '@/store/setting/useVoiceSetting.store'
import { Switch } from 'antd'

type PropsType = unknown

const VoiceSetting: FC<PropsType> = memo(() => {
  const enableVoiceSpeech = useVoiceSettingStore((s) => s.enableVoiceSpeech)

  return (
    <div className="flex items-center gap-2 mt-3">
      <p>语音播报</p>
      <Switch
        checked={enableVoiceSpeech}
        onChange={(checked) => {
          useVoiceSettingStore.getState().updateEnableVoiceSpeech(checked)
        }}
        size="small"
      />
    </div>
  )
})

VoiceSetting.displayName = 'VoiceSetting'

export default VoiceSetting
