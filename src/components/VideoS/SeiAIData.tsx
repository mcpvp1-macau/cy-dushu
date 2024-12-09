import { memo, type FC } from 'react'
import SeiEnum, { SEI_TYPE } from '../Video/Jessibuca/sei-enum'

type PropsType = {
  data: SEI_TYPE[SeiEnum.Protobuf_SEI]
}

/** 视频 SEI AI 检测 */
const SeiAIData: FC<PropsType> = memo(({ data }) => {
  return (
    <div className="absolute inset-0">
      {(data.objectList ?? []).map((item) => (
        <div
          key={item.objectId}
          className="absolute border border-solid border-green-600 group hover:border-red-600 cursor-pointer transition-all duration-300"
          style={{
            left: `${((item.bboxLeft ?? 0) / data.sourceFrameWidth) * 100}%`,
            top: `${((item.bboxTop ?? 0) / data.sourceFrameHeight) * 100}%`,
            width: `${((item.bboxWidth ?? 0) / data.sourceFrameWidth) * 100}%`,
            height: `${
              ((item.bboxHeight ?? 0) / data.sourceFrameHeight) * 100
            }%`,
          }}
        >
          <p className="w-full bg-green-600 text-center text-xs group-hover:bg-red-600 text-white transition-colors duration-300">
            {item.objectLabel}({item.objectId})
          </p>
        </div>
      ))}
    </div>
  )
})

SeiAIData.displayName = 'SeiAIData'

export default SeiAIData
