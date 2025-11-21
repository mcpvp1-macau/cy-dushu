import { DayjsInstance } from '@/components/Timeline/utils/fmt'
import { dft } from '@/constant/time-fmt'
import { getDeviceAttrInfoBack } from '@/service/modules/db-api'
import { useBackTrackingStore } from '@/store/context-store/useBackTracking.store'
import { shouldJson } from '@/utils/json'
import { sortSearchFnAsc } from '@/utils/sort'
import { useLatest, useThrottleFn } from 'ahooks'

const INTERVAL = 1000 * 60 * 10
/**
 * 属性回溯
 */
const useBackTrackingInfo = (deviceId, callbacl?) => {
  const currentTime = useBackTrackingStore((s) => s.currentTime)
  const timeRange = useBackTrackingStore((s) => s.timeRange)
  const [requestTime, setRequestTime] = useState(timeRange[0].valueOf())
  const requestTimeRef = useLatest(requestTime)
  const [time, setTime] = useState(timeRange[0].valueOf())

  const { data: attrData } = useQuery({
    queryKey: ['getDeviceAttrInfoBack', requestTime, [deviceId]],
    queryFn: async () => {
      const m = 1000 * 60
      const startTime = Math.floor(requestTime / m) * m
      const endTime = startTime + INTERVAL
      return getDeviceAttrInfoBack({
        deviceId: deviceId!,
        startTime: dayjs(startTime).format(dft),
        endTime: dayjs(endTime).format(dft),
      })
    },
    enabled: !!deviceId,
    select: (d) => d.data,
  })

  const attrIndexOf = useMemo(() => {
    if (!Array.isArray(attrData)) {
      return -1
    }

    const index =
      sortSearchFnAsc(
        attrData,
        (e) => dayjs(e.acquireTimestampFormat).valueOf() > time,
      ) - 1
    return index
  }, [attrData, time])

  const { run: handleTimeChange } = useThrottleFn(
    (v: DayjsInstance) => {
      const t = v.valueOf()
      setTime(t)
      if (
        // 当前时间小于上一次请求时间
        t - requestTimeRef.current < 0 ||
        // 当前时间超过上一次请求时间且超过间隔的 3/4
        t - requestTimeRef.current > (INTERVAL / 4) * 3 
        // ||
        // // 上一次请求没有数据
        // !Array.isArray(attrData)
      ) {
        setRequestTime(t)
      }
    },
    {
      wait: 1_000,
      trailing: true,
    },
  )

  const curAttr = useMemo(() => {
    if (!attrData || attrIndexOf < 0) {
      return null
    }
    return shouldJson(attrData[attrIndexOf])
  }, [attrIndexOf, attrData])

  useEffect(() => {
    handleTimeChange(currentTime)
  }, [currentTime])

  useEffect(() => {
    if (callbacl) {
      callbacl(curAttr)
    }
  }, [curAttr])


  return curAttr;
}

export default useBackTrackingInfo
