import { Fragment, memo, useDeferredValue, useMemo, type FC } from 'react'
import SeiEnum, { SEI_TYPE } from '../../Video/Jessibuca/sei-enum'
import { AiObject } from '../../Video/Jessibuca/sei-types/ai-data'

type PropsType = {
  data: SEI_TYPE[SeiEnum.Protobuf_SEI]
  onClickSeiBox?: (box: AiObject) => void
}

const Inner: FC<PropsType> = memo(({ data, onClickSeiBox }) => {
  const objList = useMemo(() => {
    const set = new Set()
    const list: typeof data.objectList = []
    data.objectList?.forEach((item) => {
      if (!set.has(item.objectId)) {
        list.push(item)
        set.add(item.objectId)
      }
    })
    return list
  }, [data])

  return (
    <div className="absolute inset-0">
      {objList.map((item) => {
        const isSuspicious = item.objectLabel?.includes('可疑')
        const borderClass = isSuspicious ? 'border-red-700' : 'border-green-700'
        const bgClass = isSuspicious ? 'bg-red-700' : 'bg-green-700'

        return (
          <Fragment key={item.objectId}>
            <div
              className={`absolute z-[9999] pointer-events-auto border border-solid ${borderClass} group cursor-pointer`}
              style={{
                left: `${((item.bboxLeft ?? 0) / data.sourceFrameWidth) * 100}%`,
                top: `${((item.bboxTop ?? 0) / data.sourceFrameHeight) * 100}%`,
                width: `${
                  ((item.bboxWidth ?? 0) / data.sourceFrameWidth) * 100
                }%`,
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
              <div
                className={`absolute -mt-4 text-nowrap ${bgClass} bg-opacity-70 text-center text-xs text-white`}
              >
                {item.objectLabel}({item.objectId})
              </div>
            </div>
          </Fragment>
        )
      })}
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
