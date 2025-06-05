import IconToLocation from '@/assets/icons/jsx/IconToLocation'
import AppSpin from '@/components/AppSpin'
import ImageContainBoxPreview from '@/components/ui/ImageContainBoxPreview'
import ImageContainBoxPreviewGroup from '@/components/ui/ImageContainBoxPreviewGroup'
import IconButton from '@/components/ui/button/IconButton'
import { emtpyObject } from '@/constant/data'
import { bigFlyEmitter } from '@/map/GlobalMap/BigFlyListener'
import { getEventTypeList } from '@/service/modules/events'
import { shouldJson } from '@/utils/json'
import { isNil } from 'lodash'

export const handleStorageURL = (url: string) => {
  if (!url) return ''
  // 如果是相对路径，加上前缀
  if (url?.startsWith('/storage')) {
    return url
  }
  if (url.includes('/storage')) {
    return '/storage' + url?.split('/storage')?.[1]
  }
  return '/storage' + url
}

type PropsType = {
  data: API_EVENTS.domain.Event
  useCol?: boolean
  useGo?: boolean
  swiper?: {
    swiperData: API_EVENTS.domain.Event[]
    onIndexChange: (index: number) => void
  }
}

/** 事件详情 */
const EventDetail: FC<PropsType> = memo(({ data, useCol, useGo, swiper }) => {
  const { t } = useTranslation()

  const queryClient = useQueryClient()
  const { data: eventData, isLoading: isTypeLoading } = useQuery(
    {
      queryKey: ['getEventTypeList'],
      queryFn: getEventTypeList,
      select: (d) => d.data.rows,
      staleTime: Infinity, // 永不过期
    },
    queryClient,
  )

  const properties = useMemo(() => {
    if (!data || !eventData) {
      return []
    }
    const propertiesList = eventData.find(
      (e) => e.eventType === data.eventType,
    )?.propertiesList

    if (!propertiesList) {
      return []
    }
    return propertiesList.map((e) => {
      return {
        label: e.propertyName,
        value: data[e.property],
      }
    })
  }, [eventData, data])

  const expand = useMemo(() => shouldJson(data?.expand) ?? emtpyObject, [data])

  const eventImage = (
    <ImageContainBoxPreview
      src={handleStorageURL(data.sourceImage ?? '')}
      sourceWidth={data.sourceFrameWidth}
      sourceHeight={data.sourceFrameHeight}
    >
      <ObjectsRender data={data.objectList} />
    </ImageContainBoxPreview>
  )

  return (
    <div className={clsx('flex gap-3 text-sm', { 'flex-col': useCol })}>
      {data.sourceImage && (
        <div className="w-full aspect-video relative">
          {swiper ? (
            // 如果有轮播数据
            <ImageContainBoxPreviewGroup
              items={swiper.swiperData.map((e) =>
                handleStorageURL(e.sourceImage ?? ''),
              )}
              preview={{
                onChange: swiper.onIndexChange,
              }}
              boxRender={(index) => {
                return (
                  <ObjectsRender
                    data={
                      swiper.swiperData[index].objectList ??
                      shouldJson(swiper.swiperData[index].objListJson)
                    }
                  />
                )
              }}
            >
              {eventImage}
            </ImageContainBoxPreviewGroup>
          ) : (
            // 普通版本
            eventImage
          )}
        </div>
      )}
      <div>
        {isTypeLoading ? (
          <AppSpin />
        ) : (
          <ul className="flex flex-col gap-1 whitespace-nowrap">
            {properties?.length > 0 &&
              properties.map((e) => (
                <li key={e.label} className="flex gap-3">
                  <label>{e.label}:</label>
                  <span className="text-white">{e.value}</span>
                </li>
              ))}
            {Object.keys(expand).map((e) => (
              <li key={e} className="flex gap-3">
                <label>{e}:</label>
                <span className="text-white">{JSON.stringify(expand[e])}</span>
              </li>
            ))}
            {useGo && (
              <li>
                <label>{t('common.position')}: </label>
                <IconButton>
                  <IconToLocation
                    onClick={() => {
                      if (!data.longitude || !data.latitude) {
                        return
                      }
                      bigFlyEmitter.emit('bigFly', {
                        lng: data.longitude,
                        lat: data.latitude,
                      })
                    }}
                  />
                </IconButton>
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  )
})

/** 目标对象 */
const ObjectsRender: FC<{ data: API_EVENTS.domain.Event['objectList'] }> = ({
  data,
}) => {
  return data?.map((obj, i) => {
    if (
      isNil(obj.leftTopX) ||
      isNil(obj.leftTopY) ||
      isNil(obj.bboxWidth) ||
      isNil(obj.bboxHeight)
    ) {
      return null
    }
    return (
      <div
        key={i}
        className="absolute border border-solid border-red-400"
        style={{
          left: `${(obj.leftTopX / obj.sourceFrameWidth) * 100}%`,
          top: `${(obj.leftTopY / obj.sourceFrameHeight) * 100}%`,
          right: `${
            100 - ((obj.leftTopX + obj.bboxWidth) / obj.sourceFrameWidth) * 100
          }%`,
          bottom: `${
            100 -
            ((obj.leftTopY + obj.bboxHeight) / obj.sourceFrameHeight) * 100
          }%`,
        }}
      />
    )
  })
}

EventDetail.displayName = 'EventDetail'

export default EventDetail
