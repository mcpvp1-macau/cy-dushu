import React, { useState } from 'react'
import { Button, Input, Select } from 'antd'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'

const { TextArea } = Input

type Props = {
  playing: boolean
  onPlay: (voice: string, speed: string, text: string) => void
  onChangeMode: (mode: string) => void
}

const TextTo: React.FC<Props> = (props) => {
  const { playing, onPlay, onChangeMode } = props

  const deviceModel = useDeviceDetailStore((s) => s.deviceDetail?.deviceModel)

  const getInputMethodField = (
    obj: API_DEVICE.domain.Service | undefined,
    identifier: string,
  ) => {
    return obj?.inputMethodFields?.find(
      (item) => item.identifier === identifier,
    )
  }
  const ttsControl = deviceModel?.services?.ttsControl
  const voice = getInputMethodField(ttsControl, 'voice')
  const voiceSpecs = voice?.dataType?.specs || {}

  const speed = getInputMethodField(ttsControl, 'speed')
  const speedSpecs = speed?.dataType?.specs || {}

  const ttsMode = deviceModel?.services?.ttsMode
  const mode = getInputMethodField(ttsMode, 'mode')
  const modeSpecs = mode?.dataType?.specs || {}

  const [voiceValue, setVoiceValue] = useState('0')
  const [speedValue, setSpeedValue] = useState('0')
//   const [modeValue, setModeValue] = useState('single')
  const [textValue, setTextValue] = useState('')
  //   const speed = getInputMethodField(ttsControl, 'speed');
  //   const speedSpecs = speed?.dataType?.specs || {};

  const onClick = () => {
    onPlay(voiceValue, speedValue, textValue)
  }
  return (
    <div className="flex space-x-[10px] pt-[10px]">
      <div className="w-[270px] h-[140px]">
        <TextArea
          rows={6}
          maxLength={1000}
          showCount={{
            formatter: ({ count, maxLength }) => (
              <div className="mb-[20px] mr-[10px]">
                {count}/{maxLength}
              </div>
            ),
          }}
          value={textValue}
          onChange={(e) => setTextValue(e.target.value)}
          // 阻止冒泡: 为了防止传递到 驾驶舱 的键盘事件
          onKeyDown={(e) => e.stopPropagation()}
          onKeyUp={(e) => e.stopPropagation()}
        />
      </div>
      <div className="">
        <div className="">
          <Select
            className="w-[96px] h-[26px]"
            value={voiceValue}
            onChange={setVoiceValue}
          >
            {Object.entries(voiceSpecs)?.map(([key, value]) => (
              <Select.Option key={key}>{value as string}</Select.Option>
            ))}
          </Select>
        </div>
        <div className="mt-[12px]">
          <Select
            className="w-[96px] h-[26px]"
            value={speedValue}
            onChange={setSpeedValue}
          >
            {Object.entries(speedSpecs)?.map(([key, value]) => (
              <Select.Option key={key}>{value as string}</Select.Option>
            ))}
          </Select>
        </div>
        <div className="mt-[12px]">
          <Select
            className="w-[96px] h-[26px]"
            // value={modeValue}
            defaultValue={'single'}
            onChange={onChangeMode}
          >
            {Object.entries(modeSpecs)?.map(([key, value]) => (
              <Select.Option key={key}>{value as string}</Select.Option>
            ))}
          </Select>
        </div>
        <div className="mt-[12px]">
          <Button className="w-[96px] h-[26px]" onClick={onClick}>
            {playing ? '停止' : '播放'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default React.memo(TextTo)
