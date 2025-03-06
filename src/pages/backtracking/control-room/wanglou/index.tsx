import DynamicLayoutRoot, {
  DynamicLayoutType,
} from '@/components/DynamicLayout'
import { initialLayout } from '@/pages/control-room/wanglou'
import {
  BackTrackingStoreContext,
  useCreateBackTrackingStore,
} from '@/store/context-store/useBackTracking.store'
import { useLocalStorageState } from 'ahooks'
import BackTrackingMap from '../../device/BackTrackingMap'
import BackTrackingVideo from '../../device/BackTrackingVideo'
import { getDeviceDetail } from '@/service/modules/device'
import { useStore } from 'zustand'
import StatusInfo from './StatusInfo'
import useBackTrackingInfo from '../../hooks/useBackTrackingInfo'
import BackTrackingNotControl from '../../device/BackTrackingNotControl'
import BacktrackingDetailData from '../../device/BacktrackingDetailData'
import Header from '@/pages/control-room/wanglou/components/Header'

const BackTrackingWanglouControlRoom: React.FC = () => {
  const deviceId = useParams().deviceId
  const store = useCreateBackTrackingStore()
  const { t } = useTranslation()

  const queryClient = useQueryClient()
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

  const { infraredData, visibleData } = useMemo(() => {
    let infraredData = {} as API_DEVICE.domain.Device
    let visibleData = {} as API_DEVICE.domain.Device
    data?.childDevice?.forEach((item) => {
      if (item.deviceType === 'INFRARED_CAMERA') {
        infraredData = item
      } else if (item.deviceType === 'VISIBLE_LIGHT_CAMERA') {
        visibleData = item
      }
    })
    return {
      infraredData, //.videoList?.[0],
      visibleData, //.videoList?.[0],
    }
  }, [data?.childDevice])

  const [layout, setLayout] = useLocalStorageState<DynamicLayoutType>(
    'wanglou-control-room-layout',
    { defaultValue: initialLayout },
  )

  const titleMap = useMemo(
    () => ({
      map: t('common.map'),
      video: t('ja-ke-jian-guang-shi-pin'),
      video2: t('ja-hong-wai-shi-pin'),
      ['ai-list']: t('ja-ai-shu-ju'),
      ['device-control']: t('ja-she-bei-kong-zhi'),
      ['status']: t('ja-she-bei-zhuang-tai'),
    }),
    [],
  )
  const componentMap = useMemo(
    () => ({
      map: (
        <>
          <BackTrackingMap isControlRoom />
        </>
      ),
      video: (
        <>
          {visibleData ? (
            <BackTrackingVideo
              productKey={visibleData.productKey}
              deviceId={visibleData.deviceId}
              videoId={visibleData.properties?.videoList?.[0]?.videoId || ''}
            />
          ) : null}
        </>
      ),
      video2: (
        <>
          {infraredData ? (
            <BackTrackingVideo
              productKey={infraredData.productKey}
              deviceId={infraredData.deviceId}
              videoId={infraredData.properties?.videoList?.[0]?.videoId || ''}
            />
          ) : null}
        </>
      ),
      status: (
        <>
          <StatusInfo />
        </>
      ),
      ['device-control']: (
        <>
          <BackTrackingNotControl />
        </>
      ),
      ['ai-list']: (
        <>
          {data ? (
            <BacktrackingDetailData deviceId={deviceId!} deviceDetail={data} />
          ) : null}
        </>
      ),
    }),
    [deviceId, data],
  )

  const { pathname } = useLocation()
  return (
    <BackTrackingStoreContext.Provider value={store}>
      <div
        className={clsx(
          'flex flex-col',
          pathname.startsWith('/share/') ? 'w-screen h-screen' : 'page-full',
        )}
      >
        <Header deviceName={data?.deviceName || ''} />
        <main className="grow w-full relative overflow-hidden">
          <DynamicLayoutRoot
            layout={layout!}
            onLayoutChange={setLayout}
            // iconMap={iconMap}
            titleMap={titleMap}
            componentMap={componentMap}
          />
        </main>
      </div>
    </BackTrackingStoreContext.Provider>
  )
}

export default BackTrackingWanglouControlRoom
