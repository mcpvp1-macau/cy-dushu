import React, { useRef, useState } from 'react'
import { Button, message } from 'antd'
import { useUploadMinio } from '@/hooks/useUploadMinio'
import CryptoJS, { MD5 } from 'crypto-js'
import { FFmpeg } from '@ffmpeg/ffmpeg'

type PropsType = {
  onUpload?: (file: any) => void
  stopPlay: () => void
}
const TalkTo: React.FC<PropsType> = ({ onUpload, stopPlay }) => {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const [recording, setRecording] = useState(false)

  const { uploadToMinio } = useUploadMinio('speakerRecord')

  const to16BitPCM = (input) => {
    const dataLength = input.length * (16 / 8)
    const dataBuffer = new ArrayBuffer(dataLength)
    const dataView = new DataView(dataBuffer)
    let offset = 0
    for (let i = 0; i < input.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, input[i]))
      dataView.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true)
    }
    return dataView
  }

  // webm转pcm（16k单声道s16le）
  const convertWebmToPCM = async (webmBlob: Blob): Promise<Blob | null> => {
    const ffmpeg = new FFmpeg();
    await ffmpeg.load();
    const webmBuffer = await webmBlob.arrayBuffer();
    await ffmpeg.writeFile('record.webm', new Uint8Array(webmBuffer));
    await ffmpeg.exec(['-y', '-i', 'record.webm', '-f', 's16le', '-ac', '1', '-ar', '16000', '16k.pcm']);
    const pcmData = await ffmpeg.readFile('16k.pcm');
    let pcmBuffer: ArrayBuffer;
    if (pcmData instanceof Uint8Array) {
      if (pcmData.buffer instanceof SharedArrayBuffer) {
        // 转为标准ArrayBuffer
        pcmBuffer = new Uint8Array(pcmData).buffer.slice(0);
      } else {
        pcmBuffer = pcmData.buffer;
      }
    } else {
      // string类型不处理
      return null;
    }
    return new Blob([pcmBuffer], { type: 'application/octet-stream' });
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
        const file = new File([pcmBlob], `talk_${Date.now()}.pcm`, { type: 'application/octet-stream' })
        const audioBuffer = await pcmBlob.arrayBuffer()
        const chunkArray = CryptoJS.lib.WordArray.create(audioBuffer)
        const md5 = MD5(chunkArray).toString()
        const res = await uploadToMinio(file)
        if (res) {
          message.success('PCM音频上传成功')
          onUpload &&
            onUpload({
              ...res,
              md5,
            })
        }
      }
      recorder.start()
      mediaRecorderRef.current = recorder
      setRecording(true)
    } catch (err) {
      message.error('无法访问麦克风')
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
      <Button onClick={stopPlay} disabled={!recording}>
        停止广播
      </Button>
    </div>
  )
}

export default TalkTo
