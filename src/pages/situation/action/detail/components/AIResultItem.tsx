import ImageContainBox from '@/components/ImageContainBox'
import dayjs from 'dayjs'
import { memo, type FC } from 'react'

type PropsType = {
  data: API_ACTION.domain.AIResultRecord
}

const AiResultItem: FC<PropsType> = memo(({ data }) => {
  return (
    <div>
      <p className="leading-5">{data.plateNo || '暂无结果'}</p>
      <div className="flex h-24 gap-2">
        <div className="w-[140px] h-24">
          <ImageContainBox src={`/storage${data.image || data.sourceImage}`}>
            {data.leftTopX && data.leftTopY && (
              <div
                className="absolute border border-solid border-red-400"
                style={{
                  left: `${(data.leftTopX / data.sourceFrameWidth) * 100}%`,
                  top: `${(data.leftTopY / data.sourceFrameHeight) * 100}%`,
                  right: `${
                    100 -
                    ((data.leftTopX + data.bboxWidth) / data.sourceFrameWidth) *
                      100
                  }%`,
                  bottom: `${
                    100 -
                    ((data.leftTopY + data.bboxHeight) /
                      data.sourceFrameHeight) *
                      100
                  }%`,
                }}
              />
            )}
          </ImageContainBox>
        </div>
        <ul className="flex flex-col justify-between text-fore">
          <li className="flex gap-1">
            <span>颜色:</span>
            <span>{data.plateColor || '-'}</span>
          </li>
          <li className="flex gap-1">
            <span>时间:</span>
            <span>{dayjs(data.gmtModified).format('MM/DD HH:mm:ss')}</span>
          </li>
          <li className="flex gap-1 whitespace-nowrap">
            <span>位置:</span>
            <span>
              {data.longitude.toFixed(5)}, {data.latitude.toFixed(5)}
            </span>
          </li>
          <li className="flex gap-1">
            <span>来源:</span>
            <span>{data.source}</span>
          </li>
        </ul>
      </div>
    </div>
  )
})

AiResultItem.displayName = 'AiResultItem'

export default AiResultItem
