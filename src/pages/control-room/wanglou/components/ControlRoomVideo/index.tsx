import DeviceLiveVideo from '@/components/VideoS/DeviceLiveVideo'
import useDrawVideoPosition from '../../hooks/useDrawVideoPosition'
import DrawBox from '@/components/DrawBox'

type PropsType = {
  onAspectRatioChange?: (aspectRatio: number) => void
  productKey: string
  deviceId: string
  videoId: string
}

const ControlRoomVideo: FC<PropsType> = memo(
  ({ onAspectRatioChange, productKey, deviceId, videoId }) => {
    const { enable, onChangePosition } = useDrawVideoPosition()
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
          videoChildren={<>{enable ? <DrawBox onDrawEnd={onChangePosition} /> : null}</>}
        />
      </div>
    )
  },
)

ControlRoomVideo.displayName = 'ControlRoomVideo'

export default ControlRoomVideo
