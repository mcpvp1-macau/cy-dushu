import MapUavRealMarker from '@/components/map/device/UavRealMarker'
import { dft } from '@/constant/time-fmt'
import { getTrackQuery } from '@/service/modules/db-api'
import { useBackTrackingStore } from '@/store/context-store/useBackTracking.store'
import SampledPath from './SampledPath'
import { useCesium } from 'resium'
import { attempt } from 'lodash'
import * as Cesium from 'cesium'

type PropsType = {
  deviceId: string
}
const BackTrackingPath: React.FC<PropsType> = memo(({ deviceId }) => {
  const queryClient = useQueryClient()
  const timeRange = useBackTrackingStore((s) => s.timeRange)
  const currentTime = useBackTrackingStore((s) => s.currentTime.format(dft))
  const { viewer } = useCesium()

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
      }))
    return arr || []
  }, [data, currentTime])

  const curAttr = useMemo(
    () => (lineData?.length ? lineData[lineData.length - 1] : null),
    [lineData],
  )

  // 记录是否定位过
  const flyed = useRef(false)

  useEffect(() => {
    if (viewer && curAttr?.lng && curAttr?.lat) {
      if (!viewer?.camera) {
        return
      }
      if (flyed.current) {
        return
      }
      const cameraHeight =
        Math.round(viewer?.camera?.positionCartographic?.height) ||
        curAttr.altitude + 500
      let targetHeight = cameraHeight
      if (cameraHeight > (globalConfig?.disableZoomHeight || 2000)) {
        targetHeight = curAttr.altitude + 500
      }

      const destination = Cesium.Cartesian3.fromDegrees(
        curAttr.lng,
        curAttr.lat,
        targetHeight,
      )
      attempt(() => {
        viewer.camera?.flyTo({
          destination, //相机飞入点
          duration: 0.8,
        })
        flyed.current = true
      })
    }
  }, [viewer, curAttr])

  return (
    <>
      {/* {lineData?.length && <HistoryTrackWithAlt value={lineData} useCallback />} */}
      {data?.length && <SampledPath value={data} />}
      {curAttr && (
        <MapUavRealMarker
          data={{
            longitude: curAttr.lng ?? 0,
            latitude: curAttr.lat ?? 0,
            uavYaw: curAttr.attitudeHead ?? 0,
            gimbalYaw: curAttr.gimbalHead ?? 0,
          }}
        />
      )}
    </>
  )
})

export default BackTrackingPath
