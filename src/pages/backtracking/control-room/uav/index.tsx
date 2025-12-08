import DeviceIconUAV2 from '@/assets/icons/jsx/device/DeviceIconUAV2'
import IconAISwitch from '@/assets/icons/jsx/IconAISwitch'
import IconCameraVideo from '@/assets/icons/jsx/IconCameraVideo'
import IconDeviceData from '@/assets/icons/jsx/IconDeviceData'
import IconMap from '@/assets/icons/jsx/IconMap'
import IconPayload from '@/assets/icons/jsx/IconPayload'
import IconDrawArea from '@/assets/icons/jsx/right-tools/IconDrawArea'
import IconFlightOperation from '@/assets/icons/jsx/uav/IconFlightOperation'
import IconFlightParams from '@/assets/icons/jsx/uav/IconFlightParams'
import DynamicLayoutRoot from '@/components/DynamicLayout'
import ControlRoomUavHeader from './Header'
import { useUavControlRoomLayoutStore } from '@/pages/control-room/uav/hooks/useUavControlRoomLayout.store'
import BackTrackingNotControl from '../../device/BackTrackingNotControl'
import BackTrackingMap from '../../device/BackTrackingMap'
import {
  BackTrackingStoreContext,
  useCreateBackTrackingStore,
} from '@/store/context-store/useBackTracking.store'
import { getDeviceDetail } from '@/service/modules/device'
import BackTrackingVideo from '../../device/BackTrackingVideo'
import BacktrackingDetailData from '../../device/BacktrackingDetailData'

const BackTrackingUavControlRoom: React.FC = () => {
  const deviceId = useParams().deviceId
  const store = useCreateBackTrackingStore()

  const layout = useUavControlRoomLayoutStore((s) => s.layout)
  const updateLayout = useUavControlRoomLayoutStore((s) => s.updateLayout)

  const { t } = useTranslation()
  const iconMap = useMemo(
    () => ({
      map: <IconMap className="text-blue-500" />,
      video: <IconCameraVideo className="text-blue-500" />,
      flyParams: <IconFlightOperation className="text-orange-500" />,
      flyButtons: <DeviceIconUAV2 className="text-purple-500" />,
      flyParamsSetting: <IconFlightParams className="text-emerald-500" />,
      payload: <IconPayload className="text-orange-500" />,
      'ai-list': <IconAISwitch className="text-violet-500" />,
      'device-data': <IconDeviceData className="text-emerald-500" />,
      overlay: <IconDrawArea className="text-blue-500" />,
    }),
    [],
  )

  const titleMap = useMemo(
    () => ({
      map: t('common.map'),
      video: t('common.video'),
      flyParams: t('controlRoom.uav.flyParams.title'),
      flyButtons: t('controlRoom.uav.flyButtons.title'),
      flyParamsSetting: t('controlRoom.uav.flyParamsSetting.title'),
      payload: t('controlRoom.uav.payload.title'),
      ['ai-list']: t('controlRoom.uav.aiList.title'),
      ['device-data']: t('controlRoom.uav.deviceData.title'),
      overlay: t('controlRoom.uav.overlay.title'),
    }),
    [t],
  )
  const queryClient = useQueryClient()
  const { data, _isLoading } = useQuery(
    {
      queryKey: ['deviceDetail', deviceId],
      queryFn: () => getDeviceDetail(deviceId!),
      enabled: !!deviceId,
      select: (d) => d.data,
    },
    queryClient,
  )

  const { productKey } = data?.deviceModel || {}
  const videoId = data?.properties?.videoList?.[0].videoId

  const componentMap = useMemo(
    () => ({
      map: (
        <>
          <BackTrackingMap isControlRoom />
        </>
      ),
      video: (
        <>
          {productKey ? (
            <BackTrackingVideo
              productKey={productKey!}
              deviceId={deviceId!}
              videoId={videoId}
            />
          ) : null}
        </>
      ),
      flyParams: <BackTrackingNotControl />,
      flyParamsSetting: <BackTrackingNotControl />,
      payload: <BackTrackingNotControl />,
      ['device-data']: (
        <>
          {data ? (
            <BacktrackingDetailData deviceId={deviceId!} deviceDetail={data} />
          ) : null}
        </>
      ),
      flyButtons: <BackTrackingNotControl />,
      ['ai-list']: <BackTrackingNotControl />,
      overlay: <>123</>,
    }),
    [data],
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
        {data ? (
          <ControlRoomUavHeader
            productKey={productKey!}
            deviceId={deviceId!}
            deviceName={data?.deviceName}
          />
        ) : (
         null
        )}
        <main className="grow w-full relative overflow-hidden">
          <DynamicLayoutRoot
            layout={layout!}
            onLayoutChange={updateLayout}
            iconMap={iconMap}
            titleMap={titleMap}
            componentMap={componentMap}
          />
        </main>
      </div>
    </BackTrackingStoreContext.Provider>
  )
}

export default BackTrackingUavControlRoom
