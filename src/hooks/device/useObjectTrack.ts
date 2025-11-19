import { useMemoizedFn } from 'ahooks'
import { useRef } from 'react'

/**
 * 目标跟踪启用关闭, 发送请求
 * @param enable
 * @param takeService
 * @param identify
 * @returns
 */
const useObjectTrack = (
  enable,
  takeService: (type: string, data: any) => unknown,
  identify = 'smartTrack',
) => {
  const enableRef = useRef(enable)

  if (enable !== enableRef.current) {
    enableRef.current = enable
    if (!enable) {
      takeService(identify, {
        enable: false,
      })
    }
  }

  const handlePostObjectTrack = useMemoizedFn(
    (payload: {
      enable: boolean
      x1?: number
      y1?: number
      x2?: number
      y2?: number
      frame_no?: number
      object_label?: string
      label_value?: string
      object_id?: string
      objectId?: string
    }) => {
      if (enableRef.current) {
        takeService(identify, payload)
      }
    },
  )

  const handleDrawEnd = useMemoizedFn(
    (rect: [number, number, number, number]) => {
      handlePostObjectTrack({
        x1: rect[0],
        y1: rect[1],
        x2: rect[2],
        y2: rect[3],
        enable: true,
      })
    },
  )

  return {
    enabledTrack: enable,
    handleDrawEnd,
    handlePostObjectTrack,
  }
}

export default useObjectTrack
