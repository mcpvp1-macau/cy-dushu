import React, { useRef, useState } from 'react'
import { Button, message } from 'antd'
import { useUploadMinio } from '@/hooks/useUploadMinio'
import CryptoJS, { MD5 } from 'crypto-js'

type PropsType = {
  onUpload?: (file: any) => void
  stopPlay: () => void
}
const TalkTo: React.FC<PropsType> = ({ onUpload, stopPlay }) => {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const [recording, setRecording] = useState(false)

  const { uploadToMinio } = useUploadMinio('speakerRecord')
  // webm转pcm（16k单声道s16le）
  const convertWebmToPCM = async (webmBlob: Blob): Promise<Blob | null> => {
    // 1. 解码 webm
    const arrayBuffer = await webmBlob.arrayBuffer()
    const audioCtx = new (window.AudioContext ||
      (window as any).webkitAudioContext)()
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer)

    // 2. 重采样到 16k 单声道
    const offlineCtx = new OfflineAudioContext({
      numberOfChannels: 1,
      length: Math.ceil(audioBuffer.duration * 16000),
      sampleRate: 16000,
    })
    const source = offlineCtx.createBufferSource()
    // 合成单声道
    const monoBuffer = offlineCtx.createBuffer(
      1,
      audioBuffer.length,
      audioBuffer.sampleRate,
    )
    const input =
      audioBuffer.numberOfChannels > 1
        ? audioBuffer
            .getChannelData(0)
            .map((v, i) => (v + audioBuffer.getChannelData(1)[i]) / 2)
        : audioBuffer.getChannelData(0)
    monoBuffer.copyToChannel(input, 0)
    source.buffer = monoBuffer
    source.connect(offlineCtx.destination)
    source.start()
    const renderedBuffer = await offlineCtx.startRendering()

    // 3. 导出 s16le PCM
    const pcmData = renderedBuffer.getChannelData(0)
    const buffer = new ArrayBuffer(pcmData.length * 2)
    const view = new DataView(buffer)
    for (let i = 0; i < pcmData.length; i++) {
      const s = Math.max(-1, Math.min(1, pcmData[i]))
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true)
    }
    return new Blob([buffer], { type: 'application/octet-stream' })
  }

  // 开始录音
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks: BlobPart[] = []
      recorder.ondataavailable = (e) => chunks.push(e.data)
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        message.success('录音完成，正在转码...')
        // 转码webm为pcm
        const pcmBlob = await convertWebmToPCM(blob)
        if (!pcmBlob) {
          message.error('转码失败，请重试')
          return
        }
        console.log('pcmBlob', pcmBlob)
        message.success('转码完成，正在上传...')
        const file = new File([pcmBlob], `talk_${Date.now()}.pcm`, {
          type: 'application/octet-stream',
        })
        const audioBuffer = await pcmBlob.arrayBuffer()
        const chunkArray = CryptoJS.lib.WordArray.create(audioBuffer)
        const md5 = MD5(chunkArray).toString()
        const res = await uploadToMinio(file)
        if (res) {
          message.success('PCM音频上传成功')
          if (onUpload) {
            onUpload({
              ...res,
              md5,
            })
          }
        }
      }
      recorder.start()
      mediaRecorderRef.current = recorder
      setRecording(true)
    } catch (err) {
      message.error('无法访问麦克风')
      console.error(err)
    }
  }

  // 停止录音
  const stopRecording = async () => {
    mediaRecorderRef.current?.stop()
    setRecording(false)
  }

  // getAudioFile 已废弃，转码后直接生成 File

  return (
    <div className="flex gap-2 p-2">
      <Button onClick={startRecording} disabled={recording}>
        录制喊话
      </Button>
      <Button onClick={stopRecording} disabled={!recording}>
        开始广播
      </Button>
      <Button onClick={stopPlay} disabled={false}>
        停止广播
      </Button>
    </div>
  )
}

export default TalkTo
