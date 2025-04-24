import IconToLocation from '@/assets/icons/jsx/IconToLocation'
import AppSpin from '@/components/AppSpin'
import ImageContainBoxPreview from '@/components/ImageContainBoxPreview'
import IconButton from '@/components/ui/button/IconButton'
import { emtpyObject } from '@/constant/data'
import { bigFlyEmitter } from '@/map/GlobalMap/BigFlyListener'
import { getEventDetail, getEventTypeList } from '@/service/modules/events'
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
  eventId: string
  useCol?: boolean
  useGo?: boolean
}

/** 事件详情 */
const EventDetail: FC<PropsType> = memo(({ eventId, useCol, useGo }) => {
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

  const { data, isLoading } = useQuery(
    {
      queryKey: ['getEventDetail', eventId],
      queryFn: () => getEventDetail(eventId),
      enabled: !!eventId,
      select: (d) => d.data,
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

  if (!data || isLoading) {
    return <AppSpin />
  }

  return (
    <div className={clsx('flex gap-3 text-sm', { 'flex-col': useCol })}>
      {data.sourceImage && (
        <div className="w-full aspect-video relative">
          <ImageContainBoxPreview
            src={handleStorageURL(data.sourceImage ?? '')}
            sourceWidth={data.sourceFrameWidth}
            sourceHeight={data.sourceFrameHeight}
          >
            {data.objectList?.map((obj, i) => {
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
                      100 -
                      ((obj.leftTopX + obj.bboxWidth) / obj.sourceFrameWidth) *
                        100
                    }%`,
                    bottom: `${
                      100 -
                      ((obj.leftTopY + obj.bboxHeight) /
                        obj.sourceFrameHeight) *
                        100
                    }%`,
                  }}
                />
              )
            })}
          </ImageContainBoxPreview>
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
                    onClick={() =>
                      bigFlyEmitter.emit('bigFly', {
                        lng: data.longitude,
                        lat: data.latitude,
                      })
                    }
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

EventDetail.displayName = 'EventDetail'

export default EventDetail
