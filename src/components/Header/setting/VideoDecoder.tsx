import {
  supportMse,
  supportSimd,
  supportWCS,
  supportWCSHevc,
} from '@/utils/video/video-support'
import useVideoEncoderStore from '@/store/useVideoEncoder.store'
import { Radio } from 'antd'

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
        className="mt-1"
        options={options}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <div>
        <p className="py-1">{t('setting.video_decoder.attention')}</p>
        <p className="text-xs">{t('setting.video_decoder.description')}</p>
      </div>
    </div>
  )
})

VideoDecoder.displayName = 'VideoDecoder'

export default VideoDecoder
