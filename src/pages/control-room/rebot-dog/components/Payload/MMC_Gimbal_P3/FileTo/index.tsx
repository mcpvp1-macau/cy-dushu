import Icon from '@/components/Icon'
import { useRebotDogControlRoomStore } from '@/store/context-store/useRebotDogControlRoom.store'
import { Modal, Tooltip } from 'antd'
import React from 'react'

type Props = {
  playing: boolean
  onPlay: (fileName: string, action: 'play' | 'pause') => void
  onDelete: (fileName: string) => void
}

const FileTo: React.FC<Props> = (props) => {
  const { playing, onPlay, onDelete } = props
  const recordAudioFiles =
    useRebotDogControlRoomStore((m) => m.state?.recordAudioFiles) || ''

  const currentSelectedRecordAudioFile =
    useRebotDogControlRoomStore(
      (m) => m.state?.currentSelectedRecordAudioFile,
    ) || ''

  const Arr = recordAudioFiles.split(',').filter((item: string) => !!item)

  const play = (item: string) => {
    onPlay(item, 'play')
  }
  const pause = (item: string) => {
    onPlay(item, 'pause')
  }

  const handleDelete = (item: string) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除音频文件 "${item}" 吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        onDelete(item)
      },
    })
  }

  const render = (item: string, index: number) => {
    return (
      <div className="flex justify-between mb-[8px] pl-[10px] pt-[10px] pr-[12px]">
        <div>
          {index + 1} {item}
        </div>
        <div className="flex items-center">
          {playing && currentSelectedRecordAudioFile === item ? (
            <Tooltip title={'停止播放'}>
              <Icon
                id="icon-pause"
                className="ml-[10px] text-fore hover:text-primary cursor-pointer"
                onClick={() => pause(item)}
              />
            </Tooltip>
          ) : (
            <Tooltip title={'单次播放'}>
              <Icon
                id="icon-play"
                className="ml-[10px] text-fore hover:text-primary cursor-pointer"
                onClick={() => play(item)}
              />
            </Tooltip>
          )}
          <Tooltip title={'删除'}>
            <Icon
              id="icon-delete"
              className="ml-[10px] text-fore hover:text-[#FF4D4F] cursor-pointer"
              onClick={() => handleDelete(item)}
            />
          </Tooltip>
        </div>
      </div>
    )
  }
  return <div>{Arr.map(render)}</div>
}

export default React.memo(FileTo)
