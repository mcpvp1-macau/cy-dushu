import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { controlRoomUavEmitter, TargetAppearancePayload } from '../../../events'
import usePostDeviceService from '@/pages/right/DeviceDetail/hooks/usePostDeviceService'
import XModal from '@/components/XModal'

/** 处理目标出现进行智能追踪 */
const useHandleObjectTrack = () => {
  const serviceHave = useDeviceDetailStore((s) => s.serviceHave)
  const hasSmartTrackService = !!serviceHave['smartTrack']
  const postDeviceService = usePostDeviceService()

  const [modalOpen, setModalOpen] = useState(false)
  const [targetObjectId, setTargetObjectId] = useState<string>()

  const handleClose = () => {
    setModalOpen(false)
    setTargetObjectId(undefined)
  }

  const handleConfirm = () => {
    if (!targetObjectId) return
    postDeviceService('targetTrack', {
      objectId: targetObjectId,
      object_id: targetObjectId,
      enable: true,
    })
    handleClose()
  }

  useEffect(() => {
    if (!hasSmartTrackService) return

    const handleTargetAppearance = ({
      objectId,
      status,
    }: TargetAppearancePayload) => {
      if (status !== 'APPEARANCE') return
      setTargetObjectId(objectId)
      setModalOpen(true)
    }
    controlRoomUavEmitter.on('targetAppearance', handleTargetAppearance)
    return () => {
      controlRoomUavEmitter.off('targetAppearance', handleTargetAppearance)
    }
  }, [hasSmartTrackService, postDeviceService])

  return {
    modalContextHolder: (
      <XModal
        title="智能追踪"
        open={modalOpen}
        cancelText="取消"
        confirmTitle="追踪"
        onClose={handleClose}
        onConfirm={handleConfirm}
        destroyOnHidden
      >
        {targetObjectId
          ? `检测到目标 ${targetObjectId} 出现，是否立即追踪？`
          : '检测到目标出现，是否立即追踪？'}
      </XModal>
    ),
  }
}

export default useHandleObjectTrack
