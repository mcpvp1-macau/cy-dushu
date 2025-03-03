import AppViewSuspense from '@/components/AppViewSuspense'
import CesiumMap from '@/map/CesiumMap'
import { memo, type FC } from 'react'
import { getDeviceDetail } from '@/service/modules/device'
import AppSpin from '@/components/AppSpin'
import BackTrackWarpper from './BackTrackWarpper'
import {
  useCreateBackTrackingStore,
  BackTrackingStoreContext,
} from '@/store/context-store/useBackTracking.store'
import TimelineWarpper from './TimelineWarpper'
import TargetBacktracking from '../target'
import { useStore } from 'zustand'
import { shouldJson } from '@/utils/json'
import { useThrottleFn } from 'ahooks'
import { DayjsInstance } from '@/components/Timeline/utils/fmt'
import { sortSearchFnAsc } from '@/utils/sort'

type PropsType = unknown

/** 设备回溯 */
const PageBackTrackingDevice: FC<PropsType> = memo(() => {
  const queryClient = useQueryClient()

  const deviceId = useParams().deviceId

  const store = useCreateBackTrackingStore()

  const updateDetail = useStore(store, (s) => s.updateDetail)

  const { data, isLoading } = useQuery(
    {
      queryKey: ['deviceDetail', deviceId],
      queryFn: () => getDeviceDetail(deviceId!),
      enabled: !!deviceId,
      select: (d) => {
        updateDetail(d.data)
        return d.data
      },
    },
    queryClient,
  )

  const [timeRange, setTimeRange] = useState<[DayjsInstance, DayjsInstance]>([
    dayjs().subtract(1, 'days'),
    dayjs(),
  ])

  const [requestTime, setRequestTime] = useState(timeRange[0].valueOf())
  const [time, setTime] = useState(timeRange[0].valueOf())

  const { data: attrData } = useQuery({
    queryKey: ['getUavDeviceAttrBackV2', requestTime, [deviceId]],
    queryFn: async () => {
      const m = 1000 * 60
      const startTime = Math.floor(requestTime / m) * m
      const endTime = startTime + INTERVAL
      return getUavDeviceAttrBackV2({
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
      if (t - requestTime < 0 || t - requestTime > (INTERVAL / 4) * 3) {
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
    return shouldJson(attrData[attrIndexOf].properties)
  }, [attrIndexOf, attrData])

  return (
    <BackTrackingStoreContext.Provider value={store}>
      <div className="fixed top-[39px] left-[39px] right-0 bottom-0">
        <CesiumMap id="backtracking">
          <div
            className={clsx(
              'absolute top-3 right-3 z-10',
              'bg-[#16202be6] rounded-[3px]',
              'border border-solid border-ground-5',
              'flex flex-col',
              'overflow-y-hidden',
            )}
            style={{ maxHeight: 'calc(100vh - 192px' }}
          >
            <AppViewSuspense>
              {isLoading || !data ? (
                <AppSpin />
              ) : (
                <>
                  <BackTrackWarpper data={data} />
                </>
              )}
            </AppViewSuspense>
          </div>
          <div className="absolute bottom-3 left-3 right-14 z-50">
            <TimelineWarpper />
          </div>
          <TargetBacktracking deviceId={deviceId!} />
        </CesiumMap>
      </div>
    </BackTrackingStoreContext.Provider>
  )
})

PageBackTrackingDevice.displayName = 'PageBackTrackingDevice'

export default PageBackTrackingDevice
