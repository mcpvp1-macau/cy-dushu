import { DayjsInstance } from '@/components/Timeline/utils/fmt'
import { dft } from '@/constant/time-fmt'
import { getTargetPositionBack } from '@/service/modules/db-api'
import { useBackTrackingStore } from '@/store/context-store/useBackTracking.store'
import { shouldJson } from '@/utils/json'
// import { sortSearchFnAsc } from '@/utils/sort'
import { useThrottleFn } from 'ahooks'
const INTERVAL = 1000 * 60 * 10
/**
 * 目标回溯
 */
const useBackTrackingTarget = (deviceId) => {
  const currentTime = useBackTrackingStore((s) => s.currentTime)
  const timeRange = useBackTrackingStore((s) => s.timeRange)
  const [requestTime, setRequestTime] = useState(timeRange[0].valueOf())
  const [time, setTime] = useState(timeRange[0].valueOf())

  const { data: attrData } = useQuery({
    queryKey: ['getTargetPositionBack', requestTime, [deviceId]],
    queryFn: async () => {
      const m = 1000 * 60
      const startTime = Math.floor(requestTime / m) * m
      const endTime = startTime + INTERVAL
      return getTargetPositionBack({
        parentId: deviceId!,
        startTime: dayjs(startTime).format(dft),
        endTime: dayjs(endTime).format(dft),
      })
    },
    enabled: !!deviceId,
    select: (d) => d.data,
  })

  //   const attrIndexOf = useMemo(() => {
  //     if (!Array.isArray(attrData)) {
  //       return -1
  //     }

  //     const index =
  //       sortSearchFnAsc(
  //         attrData,
  //         (e) => dayjs(e.acquireTimestampFormat).valueOf() > time,
  //       ) - 1
  //     return index
  //   }, [attrData, time])

  const { run: handleTimeChange } = useThrottleFn(
    (v: DayjsInstance) => {
      const t = v.valueOf()
      setTime(t)
      if (
        // 当前时间小于上一次请求时间
        t - requestTime < 0 ||
        // 当前时间超过上一次请求时间且超过间隔的 3/4
        t - requestTime > (INTERVAL / 4) * 3 ||
        // 上一次请求没有数据
        !Array.isArray(attrData)
      ) {
        setRequestTime(t)
      }
    },
    {
      wait: 1_000,
      trailing: true,
    },
  )

  //   const curAttr = useMemo(() => {
  //     if (!attrData || attrIndexOf < 0) {
  //       return null
  //     }
  //     return shouldJson(attrData[attrIndexOf])
  //   }, [attrIndexOf, attrData])

  const allTargets = useMemo(() => {

    const targets: Record<string, any> = []
    attrData?.forEach((item) => {
      const targetInfo = shouldJson(item.targetInfo)
      targets.push({ ...item, targetInfo })
    })

    return targets
  }, [attrData])

  useEffect(() => {
    handleTimeChange(currentTime)
  }, [currentTime])

  const { targets, boardObj } = useMemo(() => {
    if (!allTargets) {
      return { curAttr: null, boardObj: {} }
    }
    const c: Record<string, any> = []
    const obj = {}
    allTargets.forEach((item) => {
      item.targetInfo.forEach((target, i) => {
        if (dayjs(target.acquireTimestampFormat).valueOf() <= time) {
          const last = i === item.targetInfo.length - 1
          c.push({
            targetId: item.target_id,
            ...target,
            id: `${item.target_id}-${i}`,
            last,
            tid: `radartarget--${last ? 'last' : 'nor'}--${item.target_id}--${
              target.targetPitch
            }--${target.targetYaw}--${deviceId}--${item.device_id}--${
              target.sourceType
            }--${i}--${target.uploadMode}`,
          })
          if (last) {
            obj[item.target_id] = {
              ...target,
              targetId: item.target_id,
              parentId: deviceId,
              deviceId: item.device_id,
            }
          }
        } else {
          // 超过当前时间的不再添加
          // 修改last
          const d = c.find((v) => v.id === `${item.target_id}-${i - 1}`)
          if (d) {
            d.last = true
            obj[item.target_id] = {
              ...d,
              targetId: item.target_id,
              parentId: deviceId,
              deviceId: item.device_id,
            }
          }
        }
      })
    })
    // return allTargets.filter(
    //   (item) => dayjs(item.acquireTimestampFormat).valueOf() <= time,
    // )
    return { targets: c, boardObj: obj }
  }, [allTargets, time])

  return { targets, boardObj }
}

export default useBackTrackingTarget
