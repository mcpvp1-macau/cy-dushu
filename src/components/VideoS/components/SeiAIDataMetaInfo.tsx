import { DisplayMeta } from '@/components/Video/Jessibuca/sei-types/ai-data'
import { limitNum } from '@/utils/math'

type PropsType = {
  data: DisplayMeta[]
  videoWidth?: number
}

/** 视频 SEI AI 检测 meta 信息 */
const SeiAIDataMetaInfo: FC<PropsType> = memo(({ data, videoWidth = 1440 }) => {
  return (
    <ul
      className="absolute left-0 bottom-8 text-sm text-white bg-black bg-opacity-20 rounded-lg backdrop-blur-sm p-1 z-10 pointer-events-none origin-bottom-left"
      style={{
        transform: `scale(${limitNum(videoWidth / 1440, 0.5, 1)})`,
      }}
    >
      {data.map((e, i) => (
        <li key={i}>{e?.displayText}</li>
      ))}
    </ul>
  )
})

SeiAIDataMetaInfo.displayName = 'SeiAIDataMetaInfo'

export default SeiAIDataMetaInfo
