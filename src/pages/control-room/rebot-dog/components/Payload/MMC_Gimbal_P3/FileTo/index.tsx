import Icon from '@/components/Icon'
import { useRebotDogControlRoomStore } from '@/store/context-store/useRebotDogControlRoom.store'
import { Tooltip } from 'antd'
import React from 'react'

type Props = {
  playing: boolean
  onPlay: (fileName: string, action: 'play' | 'pause') => void
}

const FileTo: React.FC<Props> = (props) => {
  const { playing, onPlay } = props
  const recordAudioFiles =
    useRebotDogControlRoomStore((m) => m.state?.recordAudioFiles) || ''

  const currentSelectedRecordAudioFile =
    useRebotDogControlRoomStore((m) => m.state?.currentSelectedRecordAudioFile) || ''

  const Arr = recordAudioFiles.split(',').filter((item: string) => !!item)

  const play = (item: string) => {
    onPlay(item, 'play')
  }
  const pause = (item: string) => {
    onPlay(item, 'pause')
  }

  const render = (item: string, index: number) => {
    return (
      <div className="flex justify-between mb-[8px] pl-[10px] pt-[10px] pr-[12px]">
        <div>
          {index + 1} {item}
        </div>
        <div>
          {playing && currentSelectedRecordAudioFile === item ? (
            <Tooltip title={'停止播放'}>
              <Icon
                id="icon-pause"
                className="ml-[10px] text-[#C7D1DC] hover:text-[#4C90F0] cursor-pointer"
                onClick={() => pause(item)}
              />
            </Tooltip>
          ) : (
            <Tooltip title={'单次播放'}>
              <Icon
                id="icon-play"
                className="ml-[10px] text-[#C7D1DC] hover:text-[#4C90F0] cursor-pointer"
                onClick={() => play(item)}
              />
            </Tooltip>
          )}
        </div>
      </div>
    )
  }
  return <div>{Arr.map(render)}</div>
}

export default React.memo(FileTo)
