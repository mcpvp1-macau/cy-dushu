import { useDebounceFn } from 'ahooks'
import SeiEnum, { SEI_TYPE } from '@/components/Video/Jessibuca/sei-enum'

/** 处理 AI 视频框相关 */
const useAIDataState = () => {
  const [aiData, _setAIData] = useState<SEI_TYPE[SeiEnum.Protobuf_SEI] | null>(
    null,
  )

  const { run: clearAIData } = useDebounceFn(
    () => {
      _setAIData(null)
    },
    { wait: 3000 },
  )

  const setAiData = useMemoizedFn(
    (data: SEI_TYPE[SeiEnum.Protobuf_SEI] | null) => {
      if (!data) {
        _setAIData(null)
        return
      }
      if (!data?.ref) {
        _setAIData(data)
      }
      clearAIData()
    },
  )

  return [aiData, setAiData] as const
}

export default useAIDataState
