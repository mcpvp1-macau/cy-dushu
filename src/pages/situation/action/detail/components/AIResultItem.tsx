import dayjs from 'dayjs'
import ImageContainBoxPreview from '@/components/ImageContainBoxPreview'

type PropsType = {
  data: API_ACTION.domain.AIResultRecord
}

const AiResultItem: FC<PropsType> = memo(({ data }) => {
  const { t } = useTranslation()

  return (
    <div>
      <p className="leading-5">
        {data.plateNo || t('action.detail.aiResult.empty.title')}
      </p>
      <div className="flex h-24 gap-2">
        <div className="w-[140px] h-24 relative">
          <ImageContainBoxPreview
            src={`/storage${data.image || data.sourceImage}`}
            sourceWidth={data.sourceFrameWidth}
            sourceHeight={data.sourceFrameHeight}
          >
            {data.bboxWidth && data.bboxHeight ? (
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
            ) : null}
          </ImageContainBoxPreview>
        </div>
        <ul className="flex flex-col justify-between text-fore">
          <li className="flex gap-1">
            <span>{t('common.color')}:</span>
            <span>{data.plateColor || '-'}</span>
          </li>
          <li className="flex gap-1">
            <span>{t('common.time')}:</span>
            <span>{dayjs(data.gmtModified).format('MM/DD HH:mm:ss')}</span>
          </li>
          <li className="flex gap-1 whitespace-nowrap">
            <span>{t('common.position')}:</span>
            <span>
              {data.longitude.toFixed(4)}, {data.latitude.toFixed(4)}
            </span>
          </li>
          <li className="flex gap-1">
            <span>{t('common.source')}:</span>
            <span className="whitespace-nowrap max-w-[120px] truncate">
              {data.source}
            </span>
          </li>
        </ul>
      </div>
    </div>
  )
})

AiResultItem.displayName = 'AiResultItem'

export default AiResultItem
