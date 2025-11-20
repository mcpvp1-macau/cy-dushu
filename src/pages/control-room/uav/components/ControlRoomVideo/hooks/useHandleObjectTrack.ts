import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { controlRoomUavEmitter, TargetAppearancePayload } from '../../../events'
import usePostDeviceService from '@/pages/right/DeviceDetail/hooks/usePostDeviceService'
import { Modal } from 'antd'

/** 处理目标出现进行智能追踪 */
const useHandleObjectTrack = () => {
  const serviceHave = useDeviceDetailStore((s) => s.serviceHave)
  const hasSmartTrackService = !!serviceHave['smartTrack']
  const postDeviceService = usePostDeviceService()

  const [modal, contextHolder] = Modal.useModal()

  useEffect(() => {
    if (!hasSmartTrackService) return

    const handleTargetAppearance = ({
      objectId,
      status,
      targetTrack,
    }: TargetAppearancePayload) => {
      if (status !== 'APPEARANCE') return
      modal.confirm({
        title: '智能追踪',
        content: `检测到目标 ${objectId} 出现，是否立即追踪？`,
        okText: '追踪',
        cancelText: '取消',
        onOk: () => {
          postDeviceService(targetTrack, { objectId, object_id: objectId })
        },
      })
    }
    controlRoomUavEmitter.on('targetAppearance', handleTargetAppearance)
    return () => {
      controlRoomUavEmitter.off('targetAppearance', handleTargetAppearance)
    }
  }, [hasSmartTrackService, postDeviceService])

  return {
    modalContextHolder: contextHolder,
  }
}

export default useHandleObjectTrack
