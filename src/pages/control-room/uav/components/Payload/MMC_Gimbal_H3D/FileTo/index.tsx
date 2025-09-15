import Icon from '@/components/Icon'
import { usePostDeviceService } from '@/hooks/device/usePostDeviceService'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { Input, Tooltip } from 'antd'
import React, { useState } from 'react'

type Props = {
  playing: boolean
  onPlay: (fileName: string, action: 'play' | 'pause') => void
}

const FileTo: React.FC<Props> = (props) => {
  const { playing, onPlay } = props
  const recordAudioFiles =
    useUavControlRoomStore((m) => m.state?.recordAudioFiles) || '5,7'

  const currentSelectedRecordAudioFile =
    useUavControlRoomStore((m) => m.state?.currentSelectedRecordAudioFile) || ''

  const detail = useDeviceDetailStore((s) => s.deviceDetail)
  const postSerivce = usePostDeviceService(
    detail?.deviceModel?.productKey || '',
    detail?.deviceId || '',
  )

  const [editIndex, setEditIndex] = useState(-1)

  const Arr = recordAudioFiles.split(',').filter((item: string) => !!item)

  const play = (item: string) => {
    onPlay(item, 'play')
  }
  const pause = (item: string) => {
    onPlay(item, 'pause')
  }

  const handleSave = async (value: string) => {
    await postSerivce('updateAudioName', {
      fileName: value,
    })
    setEditIndex(-1)
  }

  const render = (item: string, index: number) => {
    return (
      <div className="flex justify-between mb-[8px] pl-[10px] pt-[10px] pr-[12px]">
        <div className="flex space-x-2 items-center">
          <span>{index + 1}</span>{' '}
          <span>
            {editIndex === index ? (
              <Input id={`file-to-input-${index}`} defaultValue={item} />
            ) : (
              item
            )}
          </span>
        </div>
        <div className="flex space-x-3 items-center">
          {editIndex === index ? (
            <Tooltip title={'保存'}>
              <Icon
                id="icon-baocun"
                className="ml-[10px] text-[#C7D1DC] hover:text-[#4C90F0] cursor-pointer"
                onClick={() => {
                  const value = document.getElementById(
                    `file-to-input-${index}`,
                  ) as HTMLInputElement
                  console.log('====', value.value)
                  if (value) {
                    handleSave(value.value)
                  }
                }}
              />
            </Tooltip>
          ) : (
            <Tooltip title={'编辑'}>
              <Icon
                id="icon-bianji"
                className="ml-[10px] text-[#C7D1DC] hover:text-[#4C90F0] cursor-pointer"
                onClick={() => {
                  setEditIndex(index)
                }}
              />
            </Tooltip>
          )}

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
