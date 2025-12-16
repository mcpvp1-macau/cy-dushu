import Icon from '@/components/Icon'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { Tooltip } from 'antd'
import React from 'react'
import { UploadAudio } from './UploadAudio'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { usePostDeviceService } from '@/hooks/device/usePostDeviceService'
import IconDelete from '@/assets/icons/jsx/IconDelete'
import XModal from '@/components/XModal'

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

  const [current, setCurrent] = React.useState<string>('')

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
    setCurrent(item)
  }

  const render = (item: string, index: number) => {
    return (
      <div className="w-full flex mb-[8px] pl-[10px] pt-[10px] pr-[12px]">
        <div className='flex-1 overflow-hidden text-ellipsis whitespace-nowrap'>
          {index + 1} {item}
        </div>
        <div className="w-[60px] flex items-center">
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
            <IconDelete
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
      <XModal
        open={!!current}
        title={`请再次确认`}
        onConfirm={() => {
          onDelete(current)
          setCurrent('')
        }}
        onClose={() => setCurrent('')}
      >
        确定要删除音频文件 {current} 吗？
      </XModal>
    </div>
  )
}

export default React.memo(FileTo)
