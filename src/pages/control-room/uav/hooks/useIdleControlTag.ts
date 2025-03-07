import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'

/** 获取是否是空闲的 controlTag */
const useIdleControlTag = () => {
  const controlTag = useUavControlRoomStore(
    (s) =>
      !s.state.controlTag ||
      ['any', 'normal'].includes(s.state.controlTag.toLowerCase?.()),
  )
  return controlTag
}

export default useIdleControlTag
