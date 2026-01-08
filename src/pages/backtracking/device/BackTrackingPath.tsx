// import MapUavRealMarker from '@/components/map/device/UavRealMarker'
import { dft } from '@/constant/time-fmt'
import { getTrackQuery } from '@/service/modules/db-api'
import { useBackTrackingStore } from '@/store/context-store/useBackTracking.store'
// import SampledPath from './SampledPath'
// import { useCesium } from 'resium'
// import * as Cesium from 'cesium'
import useFly from '../hooks/useFly'
import { out_of_china } from '@/utils/geo/coordtransform'
import CallbackPath from './CallbackPath'
import MapUavRealMarker from '@/components/map/device/UavRealMarker'

type PropsType = {
  deviceId: string
  enableTrackFilter?: boolean
}
const BackTrackingPath: React.FC<PropsType> = memo(
  ({ deviceId, enableTrackFilter = false }) => {
  const queryClient = useQueryClient()
  const timeRange = useBackTrackingStore((s) => s.timeRange)
  const currentTime = useBackTrackingStore((s) => s.currentTime.format(dft))
  const selectedTrackId = useBackTrackingStore((s) => s.selectedTrackId)
  // const { viewer } = useCesium()

  const { data } = useQuery(
    {
      queryKey: [
        'trackQuery',
        {
          deviceId,
          startTime: timeRange[0],
          endTime: timeRange[1],
        },
      ],
      queryFn: () =>
        getTrackQuery({
          deviceId: deviceId!,
          startTime: timeRange[0].format(dft),
          endTime: timeRange[1].format(dft),
        }),
      enabled: !!deviceId,
      select: (data) => data?.data || [],
    },
    queryClient,
  )
  const filteredData = useMemo(() => {
    if (!enableTrackFilter || !selectedTrackId) {
      return data ?? []
    }

    // 业务规则：开启筛选时，仅展示选中的轨迹点
    return (
      data?.filter(
        (item) => item?.trackId?.toString?.() === selectedTrackId,
      ) ?? []
    )
  }, [data, enableTrackFilter, selectedTrackId])

  const lineData = useMemo(() => {
    const arr = filteredData
      .filter((item) =>
        dayjs(item?.acquisitionTime).isBefore(dayjs(currentTime)),
      )
      .map((item) => ({
        ...item,
        lng: item.lng,
        lat: item.lat,
        alt: item.altitude || 0,
        longitude: item.lng,
        latitude: item.lat,
      }))

    return arr || []
  }, [filteredData, currentTime])

  const curAttr = useMemo(
    () => {
      if (lineData?.length) {
        return lineData[lineData.length - 1]
      }
      if (filteredData?.length) {
        return {
          ...filteredData[0],
          lng: filteredData[0].lng,
          lat: filteredData[0].lat,
          altitude: filteredData[0].altitude || 0,
          longitude: filteredData[0].lng,
          latitude: filteredData[0].lat,
        }
      }

      return null
    },
    [lineData, filteredData],
  )

  useFly(curAttr)



  const newData = useMemo(() => {
    return (
      filteredData
        ?.filter((item) => !out_of_china(item.lng, item.lat))
        .map((item) => ({
          ...item,
          // 边界情况：高度出现负值时兜底为 0
          altitude:
            Number(item.altitude || 0) < 0 ? 0 : Number(item.altitude || 0),
        })) || []
    )
  }, [filteredData])

  // console.info(newData.map(item => [item.lng, item.lat, item.altitude]))

  return (
    <>
      {/* {lineData?.length && <HistoryTrackWithAlt value={lineData} useCallback />} */}

      {filteredData?.length ? <CallbackPath value={newData || []} /> : null}
     
      {curAttr ? (
        <MapUavRealMarker
          data={{
            longitude: curAttr.lng ?? 0,
            latitude: curAttr.lat ?? 0,
            uavYaw: curAttr.attitudeHead ?? 0,
            gimbalYaw: curAttr.gimbalHead ?? 0,
            altitude: curAttr.altitude ?? 0,
          }}
        />
      ) : null}
    </>
  )
})

export default BackTrackingPath
