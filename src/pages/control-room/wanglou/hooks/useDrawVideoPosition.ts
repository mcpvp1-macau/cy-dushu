import { useWangLouControlRoomStore } from '@/store/context-store/useWangLouControlRoom.store'

/**
 * 指点定位
 */
const useDrawVideoPosition = () => {
  const isCameraChangePosition = useWangLouControlRoomStore(
    (s) => s.isCameraChangePosition,
  )

  const onChangePosition = (rect) => {
    console.info(rect)
  }
  return { enable: isCameraChangePosition?.enabled, onChangePosition }
}

export default useDrawVideoPosition
