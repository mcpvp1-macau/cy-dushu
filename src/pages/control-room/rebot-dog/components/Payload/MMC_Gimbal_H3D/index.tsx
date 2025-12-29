import Icon from '@/components/Icon'
import { usePostDeviceService } from '@/hooks/device/usePostDeviceService'
import useWatch from '@/hooks/useWatch'
import { useDebounceFn } from 'ahooks'
import { Slider, Tabs, TabsProps } from 'antd'

import TextTo from './TextTo'
import FileTo from './FileTo'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { useRebotDogControlRoomStore } from '@/store/context-store/useRebotDogControlRoom.store'

const MMC_Gimbal_P3: React.FC = () => {
  const productKey = useDeviceDetailStore(
    (s) =>
      s.deviceDetail?.productKey || s.deviceDetail?.deviceModel?.productKey,
  )!

  const deviceId = useRebotDogControlRoomStore((s) => s.deviceId)
  const postSerivce = usePostDeviceService(productKey, deviceId)
  const status: string | undefined = useRebotDogControlRoomStore(
    (s) => s.state.megaphoneStatus,
  )
  const systemVolume = useRebotDogControlRoomStore((s) => s.state.systemVolume)
  const audioPayloadPitch = useRebotDogControlRoomStore(
    (s) => s.state.audioPayloadPitch,
  )

  const [activeKey, setActiveKey] = useState('3')
  const [volume, setVolume] = useState(systemVolume || 31)

  useWatch(systemVolume, setVolume)

  const { run } = useDebounceFn(
    (value) => {
      postSerivce('czVolumeControl', {
        volume: value,
        type: 'system',
      })
    },
    {
      wait: 500,
    },
  )

  const onChangeVolume = (value: number) => {
    setVolume(value)
    run(value)
  }

  const onPlay = (voice: string, speed: string, text: string) => {
    postSerivce('ttsControl', {
      voice,
      speed,
      action: status === '文转音播报中' ? 'stop' : 'play',
      text,
    })
  }

  const handlePlay = (item: {id: number, name: string}, action: 'play' | 'pause') => {
    // postSerivce('recordAudioFileControl', {
    //   fileName,
    //   action,
    // })
    postSerivce('audioFileControl', {
      name: item.name,
      audioId: item.id,
      action,
    })
  }

  const onChangeMode = (mode: string) => {
    postSerivce('ttsMode', {
      mode,
    })
  }

  // "audioPayloadControl"
  const _onClick = (value: number) => {
    postSerivce('audioPayloadControl', {
      pitch: (audioPayloadPitch || 0) + value,
    })
  }

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: '文字转语音',
      children: (
        <>
          <TextTo
            onPlay={onPlay}
            playing={status === '文转音播报中'}
            onChangeMode={onChangeMode}
          />
        </>
      ),
      disabled: true,
    },
    {
      key: '2',
      label: '实时广播',
      children: <>实时广播</>,
      disabled: true,
    },
    {
      key: '3',
      label: '音频文件',
      children: (
        <>
          <FileTo onPlay={handlePlay} playing={status === '录音音乐播报中'} />
        </>
      ),
    },
  ]
  return (
    <div className="p-[12px]">
      <div className="flex space-x-2">
        <div className="flex leading-[32px] space-x-2 w-full">
          <Icon
            id="icon-volume-up"
            className="pt-[8px] text-[24px] text-[#C7D1DC]"
          />
          <Slider value={volume} onChange={onChangeVolume} className="w-full" max={31} min={0} />
          <span>{volume}</span>
        </div>
      </div>
      <div>
        <Tabs activeKey={activeKey} items={items} onChange={setActiveKey} />
      </div>
    </div>
  )
}

export default MMC_Gimbal_P3
