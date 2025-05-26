import { textToSpeech as _textToSpeech } from '@/service/modules/voice'

/** 语音播报 */
export const playTextToSpeech = async (text: string) => {
  try {
    // 使用 Axios 发送 POST 请求
    const response = await _textToSpeech(text)

    // 获取音频的 Blob 数据
    const audioBlob = response.data

    // 创建 Blob URL
    const audioUrl = URL.createObjectURL(audioBlob)

    // 获取 audio 元素并设置源
    const audioPlayer = document.createElement('audio')

    audioPlayer.src = audioUrl

    // 自动播放（注意：浏览器可能限制自动播放）
    audioPlayer.play().catch((error) => {
      console.error('播放失败:', error)
      // 可选：显示提示用户手动播放
    })

    // 清理 Blob URL
    audioPlayer.onended = () => {
      URL.revokeObjectURL(audioUrl)
      audioPlayer.remove()
    }
  } catch (error) {
    console.error('获取音频失败:', error)
  }
}
