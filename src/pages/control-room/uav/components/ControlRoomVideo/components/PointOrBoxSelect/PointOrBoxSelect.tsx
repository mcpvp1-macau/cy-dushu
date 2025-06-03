import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import PointZoom from './PointZoom'
import { ComponentRef, RefObject } from 'react'
import DeviceLiveVideo from '@/components/VideoS/DeviceLiveVideo'
import BoxSelectV1 from './BoxSelectV1'
import BoxSelectV2 from './BoxSelectV2'
import BoxSelectV3 from './BoxSelectV3'

type PropsType = {
  deviceLiveVideoRef: RefObject<ComponentRef<typeof DeviceLiveVideo>>
}

/** 指点定位 或 框选 */
const PointOrBoxSelect: FC<PropsType> = memo(({ deviceLiveVideoRef }) => {
  const posizionZoomOpen = useUavControlRoomStore((s) => s.openPointZoom)

  if (posizionZoomOpen === 1) {
    return <PointZoom />
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
