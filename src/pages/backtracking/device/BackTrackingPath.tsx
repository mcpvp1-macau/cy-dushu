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
}
const BackTrackingPath: React.FC<PropsType> = memo(({ deviceId }) => {
  const queryClient = useQueryClient()
  const timeRange = useBackTrackingStore((s) => s.timeRange)
  const currentTime = useBackTrackingStore((s) => s.currentTime.format(dft))
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
  const lineData = useMemo(() => {
    const arr = data
      ?.filter((item) =>
        dayjs(item.acquisitionTime).isBefore(dayjs(currentTime)),
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
  }, [data, currentTime, deviceId])

  const curAttr = useMemo(
    () => {
      if (lineData?.length) {
        return lineData[lineData.length - 1]
      }
      if (data?.length) {
        return {
          ...data[0],
          lng: data[0].lng,
          lat: data[0].lat,
          altitude: data[0].altitude || 0,
          longitude: data[0].lng,
          latitude: data[0].lat,
        }
      }

      return null
    },
    [lineData, deviceId],
  )

  useFly(curAttr)



  const newData = useMemo(() => {
    return data?.filter((item) => !out_of_china(item.lng, item.lat)).map(item => ({
      ...item,
      altitude: Number(item.altitude || 0) < 0 ? 0 : Number(item.altitude || 0),
    })) || []
  }, [data])

  // console.info(newData.map(item => [item.lng, item.lat, item.altitude]))

  return (
    <>
      {/* {lineData?.length && <HistoryTrackWithAlt value={lineData} useCallback />} */}

      {data?.length ? <CallbackPath value={newData || []} /> : null}
     
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
