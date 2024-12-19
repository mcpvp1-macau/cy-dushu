import { memo, useDeferredValue, type FC } from 'react'
import SeiEnum, { SEI_TYPE } from '../Video/Jessibuca/sei-enum'
import { AiObject } from '../Video/Jessibuca/sei-types/ai-data'
import { useAppMsg } from '@/hooks/useAppMsg'

type PropsType = {
  data: SEI_TYPE[SeiEnum.Protobuf_SEI]
  onClickSeiBox?: (box: AiObject) => void
}

const Inner: FC<PropsType> = memo(({ data, onClickSeiBox }) => {
  const msgApi = useAppMsg()
  const objList = useMemo(() => {
    const set = new Set()
    const list: typeof data.objectList = []
    const repeatIds: string[] = []
    data.objectList?.forEach((item) => {
      if (!set.has(item.objectId)) {
        list.push(item)
        set.add(item.objectId)
      } else {
        repeatIds.push(item.objectId)
      }
    })
    if (repeatIds.length > 0) {
      msgApi.error(`重复的目标ID: [${repeatIds.join(', ')}]`)
    }
    return list
  }, [data])

  return (
    <div className="absolute inset-0">
      {objList.map((item) => (
        <div
          key={item.objectId}
          className="absolute z-[9999] pointer-events-auto border border-solid border-green-600 group hover:border-red-600 cursor-pointer"
          style={{
            left: `${((item.bboxLeft ?? 0) / data.sourceFrameWidth) * 100}%`,
            top: `${((item.bboxTop ?? 0) / data.sourceFrameHeight) * 100}%`,
            width: `${((item.bboxWidth ?? 0) / data.sourceFrameWidth) * 100}%`,
            height: `${
              ((item.bboxHeight ?? 0) / data.sourceFrameHeight) * 100
            }%`,
          }}
          onContextMenu={(e) => {
            e.preventDefault()
          }}
          onMouseUp={(e) => {
            if (e.button === 0) {
              onClickSeiBox?.({
                ...item,
                seq: data.seq,
                sourceFrameWidth: data.sourceFrameWidth,
                sourceFrameHeight: data.sourceFrameHeight,
              })
            }
          }}
        >
          <div className="w-full text-nowrap mt-[-16px] bg-green-600 text-center text-xs group-hover:bg-red-600 text-white transition-colors duration-300">
            {item.objectLabel}({item.objectId})
          </div>
        </div>
      ))}
    </div>
  )
})

/** 视频 SEI AI 检测 */
const SeiAIData: FC<PropsType> = memo(({ data, onClickSeiBox }) => {
  const deferedValue = useDeferredValue(data)
  return <Inner data={deferedValue} onClickSeiBox={onClickSeiBox} />
})

SeiAIData.displayName = 'SeiAIData'

export default SeiAIData
