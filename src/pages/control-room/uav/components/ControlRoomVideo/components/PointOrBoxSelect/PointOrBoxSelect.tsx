import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import PointZoom from './PointZoom'
import { ComponentRef, RefObject } from 'react'
import DeviceLiveVideo from '@/components/VideoS/DeviceLiveVideo'
import BoxSelectV1 from './BoxSelectV1'
import BoxSelectV2 from './BoxSelectV2'
import BoxSelectV3 from './BoxSelectV3'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'

type PropsType = {
  deviceLiveVideoRef: RefObject<ComponentRef<typeof DeviceLiveVideo>>
}

/** 指点定位 或 框选 */
const PointOrBoxSelect: FC<PropsType> = memo(({ deviceLiveVideoRef }) => {
  const posizionZoomOpen = useUavControlRoomStore((s) => s.openPointZoom)

  const modelNumber = useDeviceDetailStore(
    (s) =>
      s.deviceDetail?.deviceTags.find((e) => e.tagName === 'MODEL_NUMBER')
        ?.tagValue || 'UNKNOWN',
  )

  if (posizionZoomOpen === 1) {
    return <PointZoom />
  }

  if (globalConfig.intelligentPhotographV1Filter?.includes(modelNumber)) {
    return <BoxSelectV1 />
  }

  if (globalConfig.intelligentPhotographVersion === 2) {
    return <BoxSelectV2 deviceLiveVideoRef={deviceLiveVideoRef} />
  }

  if (globalConfig.intelligentPhotographVersion === 3) {
    return <BoxSelectV3 deviceLiveVideoRef={deviceLiveVideoRef} />
  }

  return <BoxSelectV1 />
})

PointOrBoxSelect.displayName = 'PointOrBoxSelect'

export default PointOrBoxSelect
