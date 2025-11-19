import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { controlRoomUavEmitter, TargetAppearancePayload } from '../../../events'
import { AiObject } from '@/components/Video/Jessibuca/sei-types/ai-data'
import { ComponentRef, RefObject } from 'react'
import DeviceLiveVideo from '@/components/VideoS/DeviceLiveVideo'
import usePostDeviceService from '@/pages/right/DeviceDetail/hooks/usePostDeviceService'
import { Modal } from 'antd'

/** 处理目标出现进行智能追踪 */
const useHandleObjectTrack = (
  deviceLiveVideoRef: RefObject<ComponentRef<typeof DeviceLiveVideo>>,
) => {
  const serviceHave = useDeviceDetailStore((s) => s.serviceHave)
  const hasSmartTrackService = !!serviceHave['smartTrack']
  const postDeviceService = usePostDeviceService()

  const [modal, contextHolder] = Modal.useModal()

  useEffect(() => {
    if (!hasSmartTrackService) return

    const handleTargetAppearance = ({
      objectId,
      status,
    }: TargetAppearancePayload) => {
      const findTargetFromAiData = (objectId: string): AiObject | null => {
        const aiData = deviceLiveVideoRef.current?.getAiData()
        if (!aiData?.objectList?.length) return null
        const entity = aiData.objectList.find(
          (item) => item.objectId === objectId,
        )
        if (!entity) return null
        return {
          ...entity,
          seq: aiData.seq,
          sourceFrameWidth: aiData.sourceFrameWidth,
          sourceFrameHeight: aiData.sourceFrameHeight,
        } as AiObject
      }

      const buildSmartTrackPayload = (target?: AiObject | null) => {
        if (!target) return null
        const { sourceFrameWidth: fw, sourceFrameHeight: fh } = target
        if (!fw || !fh) return null
        const x1 = (target.bboxLeft ?? 0) / fw
        const y1 = (target.bboxTop ?? 0) / fh
        const x2 = ((target.bboxLeft ?? 0) + (target.bboxWidth ?? 0)) / fw
        const y2 = ((target.bboxTop ?? 0) + (target.bboxHeight ?? 0)) / fh
        return {
          x1,
          y1,
          x2,
          y2,
          enable: true,
          frame_no: target.seq,
          object_label: target.objectLabel,
          label_value: target.objLabelList?.[0]?.labelValue,
          object_id: target.objectId,
          objectId: target.objectId,
        }
      }

      if (status !== 'APPEARANCE') return
      modal.confirm({
        title: '智能追踪',
        content: `检测到目标 ${objectId} 出现，是否立即追踪？`,
        okText: '追踪',
        cancelText: '取消',
        onOk: () => {
          const latest = findTargetFromAiData(objectId)
          const payload = buildSmartTrackPayload(latest)
          if (payload) {
            postDeviceService('smartTrack', payload)
          }
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
