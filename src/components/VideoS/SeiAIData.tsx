import { memo, useDeferredValue, type FC } from 'react'
import SeiEnum, { SEI_TYPE } from '../Video/Jessibuca/sei-enum'
import { AiObject } from '../Video/Jessibuca/sei-types/ai-data'

type PropsType = {
  data: SEI_TYPE[SeiEnum.Protobuf_SEI]
  onClickSeiBox?: (box: AiObject) => void
}

/** 视频 SEI AI 检测 */
const SeiAIData: FC<PropsType> = memo(({ data, onClickSeiBox }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [active, setActive] = useState<string | null>(null)
  const deferedData = useDeferredValue(data)

  return (
    <div className="absolute inset-0">
      {deferedData.objectList?.map((item) => (
        <div
          key={item.objectId}
          className="absolute z-[9999] pointer-events-auto border border-solid border-green-600 group hover:border-red-600 cursor-pointer transition-colors duration-300"
          style={{
            left: `${((item.bboxLeft ?? 0) / data.sourceFrameWidth) * 100}%`,
            top: `${((item.bboxTop ?? 0) / data.sourceFrameHeight) * 100}%`,
            width: `${((item.bboxWidth ?? 0) / data.sourceFrameWidth) * 100}%`,
            height: `${
              ((item.bboxHeight ?? 0) / data.sourceFrameHeight) * 100
            }%`,
            border: active === item.objectId ? '1px solid red' : '',
          }}
          onContextMenu={(e) => {
            e.preventDefault()
            // onSeiObjectMenuClick?.(item)
          }}
          onMouseUp={(e) => {
            if (e.button === 0) {
              onClickSeiBox?.({
                ...item,
                seq: data.seq,
                sourceFrameWidth: data.sourceFrameWidth,
                sourceFrameHeight: data.sourceFrameHeight,
              })
              // setActive(item.objectId)
              // onSeiObjectClick?.(item)
            }
          }}
        >
          <div
            style={{
              backgroundColor: active === item.objectId ? 'red' : '',
            }}
            className="w-full text-nowrap mt-[-16px] bg-green-600 text-center text-xs group-hover:bg-red-600 text-white transition-colors duration-300"
          >
            {item.objectLabel}({item.objectId})
          </div>
        </div>
      ))}
    </div>
  )
})

SeiAIData.displayName = 'SeiAIData'

export default SeiAIData
