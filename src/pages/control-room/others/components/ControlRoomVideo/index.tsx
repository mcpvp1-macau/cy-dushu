import DeviceLiveVideo from '@/components/VideoS/DeviceLiveVideo'
import DrawBox from '@/components/DrawBox'
import { usePostDeviceService } from '@/hooks/device/usePostDeviceService'
import { useOthersControlRoomStore } from '@/store/context-store/useOthersControlRoom.store'
import IconBoxSelect from '@/assets/icons/jsx/uav/IconBoxSelect'
import { Button } from 'antd'
import IconIntelligentTrack from '@/assets/icons/jsx/uav/IconIntelligentTrack'
import IconPositionZoom from '@/assets/icons/jsx/uav/IconPositionZoom'
import IconButton from '@/components/ui/button/IconButton'

type PropsType = {
  onAspectRatioChange?: (aspectRatio: number) => void
  productKey: string
  deviceId: string
  videoId: string
  isHaveTapZoomAtTarget?: boolean
  parentPost?: (
    identifier: string,
    data?: any,
    msgPrefix?: string,
    showMsg?: boolean,
  ) => Promise<void>
}

const ControlRoomVideo: FC<PropsType> = memo(
  ({
    onAspectRatioChange,
    productKey,
    deviceId,
    videoId,
    parentPost,
    isHaveTapZoomAtTarget,
  }) => {
    const [enable, setEnable] = useState(false)
    const uuid = useOthersControlRoomStore((s) => s.uuid)

    const onChangePosition = (rect) => {
      parentPost?.('tapZoomAtTarget', {
        x1: rect[0],
        y1: rect[1],
        x2: rect[2],
        y2: rect[3],
        controlTag: uuid,
      })
    }

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
          // onClickSeiBox={handleSeiClick}
          videoChildren={
            <>{enable ? <DrawBox onDrawEnd={onChangePosition} /> : null}</>
          }
          rightBottom={
            <>
              {isHaveTapZoomAtTarget ? (
                <IconButton
                  className="scale-90"
                  toolTipProps={{ title: '指点跟踪' }}
                  active={!!enable}
                  onClick={() => setEnable((v) => !v)}
                >
                  <IconPositionZoom />
                </IconButton>
              ) : null}
            </>
          }
        />
      </div>
    )
  },
)

ControlRoomVideo.displayName = 'ControlRoomVideo'

export default ControlRoomVideo
