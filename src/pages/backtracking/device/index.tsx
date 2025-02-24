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

type PropsType = unknown

/** 设备回溯 */
const PageBackTrackingDevice: FC<PropsType> = memo(() => {
  const queryClient = useQueryClient()

  const deviceId = useParams().deviceId

  const store = useCreateBackTrackingStore()

  const { data, isLoading } = useQuery(
    {
      queryKey: ['deviceDetail', deviceId],
      queryFn: () => getDeviceDetail(deviceId!),
      enabled: !!deviceId,
      select: (d) => d.data,
    },
    queryClient,
  )

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
            style={{ maxHeight: 'calc(100vh - 62px' }}
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
        </CesiumMap>
      </div>
    </BackTrackingStoreContext.Provider>
  )
})

PageBackTrackingDevice.displayName = 'PageBackTrackingDevice'

export default PageBackTrackingDevice
