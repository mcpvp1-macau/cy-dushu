import { RefObject } from 'react'

const useSnapshot = (wrapperRef: RefObject<HTMLElement>) => {
  /** 截图 */
  const snapshot = (type = 'image/jpeg', quality = 0.5) => {
    const video = wrapperRef.current?.querySelector('video')
    const canvaus = video
      ? document.createElement('canvas')
      : wrapperRef.current?.querySelector('canvas')
    if (!canvaus) {
      throw new Error('未找到视频或画布')
    }
    canvaus.width = video?.videoWidth ?? canvaus.width
    canvaus.height = video?.videoHeight ?? canvaus.height
    const ctx = canvaus.getContext('2d')
    if (!ctx) {
      throw new Error('未找到画布上下文')
    }
    ctx.drawImage(video ?? canvaus, 0, 0)
    return canvaus.toDataURL(type, quality)
  }

  return snapshot
}

export default useSnapshot
