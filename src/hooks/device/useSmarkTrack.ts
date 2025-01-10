// import config from '@/global/config'
// import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
// import useControlRoomStore from '@/store/control-room';
import { useMemoizedFn } from 'ahooks'
import { useRef } from 'react'

/** 目标跟踪启用关闭, 发送请求 */
const useSmarkTrack = (enableSmartTrack, takeService: (type: string, data: any) => unknown) => {
  // const enableSmartTrack = useControlRoomStore((s) => s.enableSmartTrack);
  // const enableSmartTrack = useUavControlRoomStore((s) => s.enableSmartTrack)
  const enableSmartTrackRef = useRef(enableSmartTrack)

  if (enableSmartTrack !== enableSmartTrackRef.current) {
    enableSmartTrackRef.current = enableSmartTrack
    if (!enableSmartTrack) {
      takeService('smartTrack', {
        enable: false,
      })
    }
  }

  const handlePostSmartTrack = useMemoizedFn(
    (payload: {
      enable: boolean
      x1?: number
      y1?: number
      x2?: number
      y2?: number
      frame_no?: number
      object_label?: string
      label_value?: string
    }) => {
      if (enableSmartTrackRef.current) {
      takeService('smartTrack', payload)
      }
    },
  )

  const handleDrawEnd = useMemoizedFn(
    (pos: [number, number, number, number]) => {
      handlePostSmartTrack({
        x1: pos[0],
        y1: pos[1],
        x2: pos[2],
        y2: pos[3],
        enable: true,
      })
    },
  )

  return {
    enableSmartTrack,
    handleDrawEnd,
    handlePostSmartTrack,
  }
}

export default useSmarkTrack
