import {
  supportMse,
  supportSimd,
  supportWCS,
  supportWCSHevc,
} from '@/utils/video/video-support'
import useVideoEncoderStore from '@/store/useVideoEncoder.store'
import { Radio } from 'antd'
import IconTip from '@/assets/icons/jsx/IconTip'

type PropsType = unknown

const options = [
  {
    value: '',
    label: 'Default',
  },
  {
    value: 'useWCS',
    label: 'WCS',
    disabled: !supportWCSHevc || !supportWCS,
  },
  {
    value: 'useSIMD',
    label: 'SIMD',
    disabled: !supportSimd,
  },
  {
    value: 'useMSE',
    label: 'MSE',
    disabled: !supportMse,
  },
  {
    value: 'useWasm',
    label: 'Wasm',
  },
]

const VideoDecoder: FC<PropsType> = memo(() => {
  const value = useVideoEncoderStore((s) => s.videoEncoderValue)
  const setValue = useVideoEncoderStore((s) => s.setVideoEncoderValue)
  const { t } = useTranslation()

  return (
    <div>
      <Radio.Group
        className="mt-3"
        options={options}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <div className="flex gap-2 text-fore mt-3">
        <IconTip />
        <p className="text-xs">{t('setting.video_decoder.description')}</p>
      </div>
    </div>
  )
})

VideoDecoder.displayName = 'VideoDecoder'

export default VideoDecoder
