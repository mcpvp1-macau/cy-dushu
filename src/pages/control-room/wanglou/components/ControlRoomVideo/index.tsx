import DeviceLiveVideo from '@/components/VideoS/DeviceLiveVideo'
import useDrawVideoPosition from '../../hooks/useDrawVideoPosition'
import DrawBox from '@/components/DrawBox'
import { usePostDeviceService } from '@/hooks/device/usePostDeviceService'
import useSmarkTrack from '@/hooks/device/useSmarkTrack'
import { useWangLouControlRoomStore } from '@/store/context-store/useWangLouControlRoom.store'
import { AiObject } from '@/components/Video/Jessibuca/sei-types/ai-data'

type PropsType = {
  onAspectRatioChange?: (aspectRatio: number) => void
  productKey: string
  deviceId: string
  videoId: string
}

const ControlRoomVideo: FC<PropsType> = memo(
  ({ onAspectRatioChange, productKey, deviceId, videoId }) => {
    const { enable, onChangePosition } = useDrawVideoPosition(
      productKey,
      deviceId,
    )
    const enableSmartTrack = useWangLouControlRoomStore(
      (s) => s.enableSmartTrack,
    )
    const postService = usePostDeviceService(productKey!, deviceId!)

    const { handlePostSmartTrack } = useSmarkTrack(
      enableSmartTrack,
      postService,
    )

    const handleSeiClick = useMemoizedFn((e: AiObject) => {
      const { sourceFrameWidth: fw, sourceFrameHeight: fh, seq } = e
      if (!fw || !fh) return
      let x1 = e.bboxLeft ?? 0
      let y1 = e.bboxLeft ?? 0
      const w = e.bboxWidth
      const h = e.bboxHeight
      if (!x1 && !y1 && !w && !h) return
      const x2 = (x1 + w) / fw
      const y2 = (y1 + h) / fh
      x1 = x1 / fw
      y1 = y1 / fh
      handlePostSmartTrack({
        x1,
        y1,
        x2,
        y2,
        enable: true,
        frame_no: seq,
        object_label: e.objectLabel,
        label_value: e.objLabelList?.[0]?.labelValue,
      })
    })
    return (
      <div className="absolute inset-0  bg-black">
        <DeviceLiveVideo
          deviceId={deviceId}
          productKey={productKey}
          videoId={videoId}
          useDing={false}
          onAspectRatioChange={(v) => {
            onAspectRatioChange?.(v)
          }}
          onClickSeiBox={handleSeiClick}
          videoChildren={
            <>{enable ? <DrawBox onDrawEnd={onChangePosition} /> : null}</>
          }
        />
      </div>
    )
  },
)

ControlRoomVideo.displayName = 'ControlRoomVideo'

export default ControlRoomVideo
