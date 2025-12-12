import Icon from '@/components/Icon'
import { usePostDeviceService } from '@/hooks/device/usePostDeviceService'
import useWatch from '@/hooks/useWatch'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { useDebounceFn } from 'ahooks'
import { Slider, Tabs, TabsProps } from 'antd'
import PitchControl from './PitchControl'
import TextTo from './TextTo'
import FileTo from './FileTo'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import TalkTo from './TalkTo'

const MMC_Gimbal_P3: React.FC = () => {
  const productKey = useDeviceDetailStore(
    (s) =>
      s.deviceDetail?.productKey || s.deviceDetail?.deviceModel?.productKey,
  )!

  const deviceId = useUavControlRoomStore((s) => s.deviceId)
  const postSerivce = usePostDeviceService(productKey, deviceId)
  const status: string | undefined = useUavControlRoomStore(
    (s) => s.state.megaphoneStatus,
  )
  const systemVolume = useUavControlRoomStore((s) => s.state.systemVolume)
  const audioPayloadPitch = useUavControlRoomStore(
    (s) => s.state.audioPayloadPitch,
  )

  const [activeKey, setActiveKey] = useState('1')
  const [volume, setVolume] = useState(systemVolume || 0)

  useWatch(systemVolume, setVolume)

  const { run } = useDebounceFn(
    (value) => {
      postSerivce('volumeControl', {
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

  const handlePlay = (fileName: string, action: 'play' | 'pause') => {
    postSerivce('recordAudioFileControl', {
      fileName,
      action,
    })
  }

  const onChangeMode = (mode: string) => {
    postSerivce('ttsMode', {
      mode,
    })
  }

  // "audioPayloadControl"
  const onClick = (value: number) => {
    postSerivce('audioPayloadControl', {
      pitch: (audioPayloadPitch || 0) + value,
    })
  }

  const onUpload = async (file: { name: string; md5: string }) => {
    await postSerivce('recordAudioFileUpload', {
      name: file.name,
      url: `/storage/${globalConfig.bucketName || 'ja-media-storage'}/speakerRecord/${
        file.name
      }`,
      md5: file.md5,
      format: 'pcm',
    })
  }

  const onUploadTalk = async (file: { name: string; md5: string }) => {
    await postSerivce('recordAudioFilePlay', {
      name: file.name,
      url: `/storage/${globalConfig.bucketName || 'ja-media-storage'}/speakerRecord/${
        file.name
      }`,
      md5: file.md5,
      format: 'pcm',
      action: 'play',
    })
  }

  const stopPlay = () => {
    postSerivce('recordAudioFilePlay', {
      action: 'stop',
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
    },
    {
      key: '2',
      label: '实时广播',
      children: (
        <>
          <TalkTo onUpload={onUploadTalk} stopPlay={stopPlay} />
        </>
      ),
      disabled: !globalConfig.usePayloadP3Upload,
    },
    {
      key: '3',
      label: '音频文件',
      children: (
        <>
          <FileTo
            onUpload={onUpload}
            onPlay={handlePlay}
            playing={status === '录音音乐播报中'}
          />
        </>
      ),
    },
  ]
  return (
    <div className="p-[12px]">
      <div className="flex space-x-2 mb-[10px]">
        <PitchControl onClick={onClick} value={audioPayloadPitch} />
        <div className="flex leading-[32px] space-x-2 w-full pt-[12px]">
          <Icon
            id="icon-volume-up"
            className="pt-[8px] text-[24px] text-[#C7D1DC]"
          />
          <Slider value={volume} onChange={onChangeVolume} className="w-full" />
          <span>{volume}%</span>
        </div>
      </div>
      <div>
        <Tabs activeKey={activeKey} items={items} onChange={setActiveKey} />
      </div>
    </div>
  )
}

export default MMC_Gimbal_P3
