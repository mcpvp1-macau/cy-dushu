import Icon from '@/components/Icon'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { Modal, Tooltip } from 'antd'
import React from 'react'
import { UploadAudio } from './UploadAudio'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { usePostDeviceService } from '@/hooks/device/usePostDeviceService'

type Props = {
  playing: boolean
  onPlay: (fileName: string, action: 'play' | 'pause') => void
  onUpload: (file: any) => void
  onDelete: (fileName: string) => void
}

const FileTo: React.FC<Props> = (props) => {
  const { playing, onPlay, onUpload, onDelete } = props
  const deviceDetail = useDeviceDetailStore((m) => m.deviceDetail)
  const deviceId = deviceDetail?.deviceId || ''
  const productKey = deviceDetail?.deviceModel?.productKey || ''
  const _postDevice = usePostDeviceService(deviceId, productKey)

  const recordAudioFiles =
    useUavControlRoomStore((m) => m.state?.recordAudioFiles) || ''

  const currentSelectedRecordAudioFile =
    useUavControlRoomStore((m) => m.state?.currentSelectedRecordAudioFile) || ''

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
          <Tooltip title={'删除'}>
            <Icon
              id="icon-delete"
              className="ml-[10px] text-[#C7D1DC] hover:text-[#FF4D4F] cursor-pointer"
              onClick={() => handleDelete(item)}
            />
          </Tooltip>
        </div>
      </div>
    )
  }
  return (
    <div>
      {Arr.map(render)}
      {globalConfig.usePayloadP3Upload ? (
        <UploadAudio onUpload={onUpload} accept=".pcm" />
      ) : null}
    </div>
  )
}

export default React.memo(FileTo)
