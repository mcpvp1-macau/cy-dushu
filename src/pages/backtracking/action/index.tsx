import AppViewSuspense from '@/components/AppViewSuspense'
import CesiumMap from '@/map/CesiumMap'
import { memo, type FC } from 'react'
// import { getDeviceDetail } from '@/service/modules/device'
import AppSpin from '@/components/AppSpin'
// import BackTrackWarpper from './BackTrackWarpper'
import {
  useCreateBackTrackingStore,
  BackTrackingStoreContext,
} from '@/store/context-store/useBackTracking.store'
// import TargetBacktracking from '../target'
import TimelineWarpper from '../device/TimelineWarpper'
import { getAction } from '@/service/modules/action'
import PageActionDetailSub from '@/pages/situation/action/detail/action'
import DeviceMarker from './DeviceMarker'

type PropsType = unknown

/** 设备回溯 */
const PageBackTrackingAction: FC<PropsType> = memo(() => {
  const queryClient = useQueryClient()

  const actionId = useParams().actionId
  const startTime = useParams().startTime
  const endTime = useParams().endTime

  const store = useCreateBackTrackingStore()

  const { data, isLoading } = useQuery(
    {
      queryKey: ['action', actionId],
      queryFn: () => getAction({ actionId }),
      select: (data) => data.data,
    },
    queryClient,
  )

  //   const { data, isLoading } = useQuery(
  //     {
  //       queryKey: ['deviceDetail', deviceId],
  //       queryFn: () => getDeviceDetail(deviceId!),
  //       enabled: !!deviceId,
  //       select: (d) => d.data,
  //     },
  //     queryClient,
  //   )


  return (
    <BackTrackingStoreContext.Provider value={store}>
      <div className="fixed top-[39px] left-[39px] right-0 bottom-0">
        <CesiumMap id="backtracking">
          <div
            className={clsx(
              'absolute top-3 left-3 z-10 w-[350px]',
              'bg-[#16202be6] rounded-[3px]',
              'border border-solid border-ground-5',
              'flex flex-col',
              'overflow-y-hidden',
            )}
            style={{ maxHeight: 'calc(100vh - 192px' }}
          >
            <AppViewSuspense>
              {/* {isLoading || !data ? <AppSpin /> : <>1243</>} */}
              <h3 className="text-white text-base truncate mx-3 mt-3 min-h-6">
                {data?.name}
              </h3>
              {data && <PageActionDetailSub detail={data} isBacktracking />}
            </AppViewSuspense>
          </div>
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
          
              <DeviceMarker />
            </AppViewSuspense>
          </div>
          <div className="absolute bottom-3 left-3 right-14 z-50">
            <TimelineWarpper startTime={startTime} endTime={endTime} />
          </div>
          {/* <TargetBacktracking deviceId={deviceId!} /> */}
        </CesiumMap>
      </div>
    </BackTrackingStoreContext.Provider>
  )
})

PageBackTrackingAction.displayName = 'PageBackTrackingAction'

export default PageBackTrackingAction
