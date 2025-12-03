import CloseableHeader from '../../components/CloseableHeader'
import DeviceIconAIRPORT from '@/assets/icons/jsx/device/DeviceIconAIRPORT'
import { shouldJson } from '@/utils/json'
import useWebSocket from 'react-use-websocket'
import { heartbeat } from '@/constant/websocket'
import UavAirportWeatherSection from './components/WeatherSection'
import UavAirportInfoCard from './components/InfoCard'
import { useRealOnlineStatus } from '@/store/useGlobalWebSocket.store'
import DeviceLiveVideo from '@/components/VideoS/DeviceLiveVideo'
import { Button, Switch, Tooltip } from 'antd'
import IconDebug from '@/assets/icons/jsx/uav/IconDebug'
import IconTakeoff from '@/assets/icons/jsx/uav/IconTakeoff'
import RemoteDebug from './components/RemoteDebug'
import UavAirportUavDetail from './components/Uav'
import { ScrollArea } from '@/components/ui/scroll-area'
import FormModal from '@/components/XForm/Modal'
import { usePostDeviceService } from '@/hooks/device/usePostDeviceService'
import HealthInfoMini from '@/components/device/HealthInfoMini'
import { XFormItem } from '@/components/XForm/types'
import useDeviceWsURL from '@/hooks/device/useDeviceWsURL'
import { BaseDeviceDetailProps } from '../routes'
import XModal from '@/components/XModal'
import useIsRightDetail from '../hooks/useIsRightDetail'
import { createPortal } from 'react-dom'
import IconButton from '@/components/ui/button/IconButton'
import IconClose from '@/assets/icons/jsx/IconClose'
import UavDockConfig from './components/UavDockConfig'
import AppCollapse from '@/components/AppCollapse'
import globalConfig from '@/global/config'
import useFlightReporting from '@/hooks/jinghang/useFlightReporting'
import MaintenanceStatusSwitch from './components/MaintenanceStatusSwitch'

type PropsType = BaseDeviceDetailProps

const map = new Map<string, string>([
  ['device_reboot', '机场重启'],
  ['drone_open', '飞行器开机'],
  ['drone_close', '飞行器关机'],
  ['cover_open', '打开舱盖'],
  ['cover_close', '关闭舱盖'],
])

const UavAirportDetail: FC<PropsType> = memo(
  ({ data, headerTools, headerProps, onClose }) => {
    const productKey = data.productKey || data.deviceModel!.productKey
    const deviceId = data.deviceId
    const videoId = data?.properties.videoList?.[0]?.videoId ?? ''
    const childDeviceId = data?.childDevice?.[0]?.deviceId

    const {
      isCanFly: canTakeoff,
      reason: cannotTakeoffReason,
      isLoading: isLoadingFlightReporting,
      flightAltitudeLimit,
      returnAltitudeLimit,
    } = useFlightReporting(childDeviceId)

    const { t, i18n } = useTranslation()

    const maxFlightAltitude = useMemo(
      () => flightAltitudeLimit ?? globalConfig.uavHeightLimit,
      [flightAltitudeLimit],
    )

    const maxReturnAltitude = useMemo(
      () => returnAltitudeLimit ?? globalConfig.uavHeightLimit,
      [returnAltitudeLimit],
    )

    const items = useMemo(
      () =>
        [
          {
            label: t('device.uav.takeoffForm.takeoffHeight.title'),
            name: 'height',
            type: 'input-number',
            rules: [
              {
                required: true,
                message: t('device.uav.takeoffForm.takeoffHeight.required_msg'),
              },
            ],
            otherProps: {
              style: { width: '100%' },
              min: 1,
              max: maxFlightAltitude,
            },
          },
          {
            label: t('device.uav.takeoffForm.goHomeAltitude.title'),
            name: 'gohomeAltitude',
            type: 'input-number',
            otherProps: {
              style: { width: '100%' },
              min: 50,
              max: maxReturnAltitude,
            },
          },
        ] as XFormItem[],
      [maxFlightAltitude, maxReturnAltitude, t],
    )

    const [state, setState] = useState<Record<string, any>>({})

    const [progressState, setProgressState] = useState<any[]>([])
    /** WebSocket 处理 */
    const handleMessage = useMemoizedFn((evt: WebSocketEventMap['message']) => {
      const { data } = evt
      const wsData = shouldJson(data)
      if (!wsData) {
        return
      }
      switch (wsData.method) {
        case 'event.property.post':
        case 'properties.state':
          // 属性变化
          if (wsData.deviceId === deviceId) {
            setState({ ...state, ...wsData.data })
          }
          break
        case 'event.progress.info':
          const { data } = wsData
          const record = {
            ...data,
            time: dayjs(wsData.timestamp),
          }
          if (map.get((data.name as string).toLowerCase())) {
            setProgressState((prev) => [record, ...prev].slice(0, 10))
          }
          break
      }
    })

    const wsUrl = useDeviceWsURL(productKey, deviceId)

    useWebSocket(wsUrl, {
      heartbeat,
      reconnectAttempts: 0x3f3f3f3f,
      retryOnError: true,
      reconnectInterval: 5_000,
      shouldReconnect: () => true,
      onMessage: handleMessage,
    })

    /** 降雨量 */
    const rainfall = useMemo(() => {
      return (
        {
          zh: { '0': '无雨', '1': '小雨', '2': '中雨', '3': '大雨' },
          en: {
            '0': 'No rain',
            '1': 'Light rain',
            '2': 'Moderate rain',
            '3': 'Heavy rain',
          },
        }[i18n.language]?.[data?.properties?.rainfall ?? '-1'] ?? '-'
      )
    }, [data?.properties?.rainfall, i18n.language])

    /** 机型 */
    const modelNumber = useMemo(
      () =>
        data.deviceTags?.find((e) => e.tagName === 'MODEL_NUMBER')?.tagValue ??
        '',
      [data],
    )

    const onlineStatus = useRealOnlineStatus(deviceId)

    const header = useMemo(
      () => (
        <div className="flex justify-between gap-2">
          <div className="flex gap-2 items-center">
            <DeviceIconAIRPORT className="device-detail-icon" />
            <h6 className="text-hightlight text-base max-w-[224px] truncate">
              {data.deviceName}
            </h6>
          </div>
        </div>
      ),
      [data.deviceName],
    )

    const [openDebug, setOpenDebug] = useState(false)

    const [
      takeOffOpen,
      { setTrue: setTakeoffTrue, setFalse: setTakeoffFalse },
    ] = useBoolean(false)

    const postDeviceService = usePostDeviceService(productKey, deviceId)
    const handleTakeoffOk = async (values: any) => {
      await postDeviceService(
        'takeoff',
        values,
        t('controlRoom.uav.service.takeoff.title'),
      )
      setTakeoffFalse()
    }

    const isRightDetail = useIsRightDetail()

    const debugHeader = (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {t('device.uavDock.remoteDebug.title')}
          <Switch
            size="small"
            disabled={[1, 3, 4].includes(state['modeCode'])}
            value={state['modeCode'] === 2}
            onClick={() => {
              postDeviceService('debugMode', {
                action: state['modeCode'] === 0 ? 0 : 1,
              })
            }}
          />
        </div>
        <MaintenanceStatusSwitch
          deviceId={deviceId}
          productKey={productKey}
          deviceTags={data.deviceTags}
        />
      </div>
    )

    return (
      <div className="grow overflow-y-hidden flex flex-col">
        <CloseableHeader
          onClose={onClose}
          rightTools={headerTools}
          {...headerProps}
        >
          <div className="flex gap-2 items-center">
            {header}
            {state.healthInfo?.length && (
              <HealthInfoMini healthInfo={state.healthInfo} />
            )}
          </div>
        </CloseableHeader>
        <div className="grow flex flex-col relative  overflow-y-hidden">
          <ScrollArea className="grow">
            <div className="mx-3">
              <UavAirportWeatherSection
                windSpeed={state.windSpeed}
                rainfall={rainfall}
                temperature={state.temperature}
                environmentTemperature={state.environmentTemperature}
              />
            </div>
            <div className="my-3 mx-3">
              <UavAirportInfoCard
                modelNumber={modelNumber}
                onlineStatus={onlineStatus}
                modeDisplay={state.modeDisplay}
                stockStatus={state.isInDock}
              />
            </div>
            <div className="mx-3 overflow-hidden">
              <DeviceLiveVideo
                productKey={productKey}
                deviceId={deviceId}
                videoId={videoId}
                leftTop={<div className="text-sm">{t('common.live')}</div>}
              />
            </div>
            <div className="my-3 flex gap-2 px-3">
              <Button
                block
                className="h-7"
                icon={<IconDebug />}
                onClick={() => setOpenDebug(true)}
              >
                {t('device.uavDock.remoteDebug.title')}
              </Button>
              <Tooltip title={!canTakeoff ? cannotTakeoffReason : undefined}>
                <Button
                  loading={isLoadingFlightReporting}
                  disabled={state.modeCode !== 0 || !canTakeoff}
                  block
                  className="h-7"
                  icon={<IconTakeoff />}
                  onClick={setTakeoffTrue}
                >
                  {t('device.uavDock.takeoffForm.title')}
                </Button>
              </Tooltip>
            </div>

            {data?.childDevice?.[0]?.deviceId && (
              <UavAirportUavDetail
                deviceId={data?.childDevice?.[0]?.deviceId}
              />
            )}
            <AppCollapse
              className="mt-3"
              items={[
                {
                  key: 'uavDockConfig',
                  label: t('device.setting.title'),
                  children: <UavDockConfig state={state} />,
                },
              ]}
            />
          </ScrollArea>
        </div>
        {openDebug &&
          (isRightDetail ? (
            createPortal(
              <div className="fixed right-[406px] top-[50px] z-20 text-fore flex flex-col rounded-sm overflow-hidden">
                <div className="h-8 px-2 bg-ground-3 border-b border-solid border-ground-5 flex items-center justify-between text-sm">
                  {debugHeader}
                  <IconButton
                    className="text-xl"
                    onClick={() => setOpenDebug(false)}
                  >
                    <IconClose />
                  </IconButton>
                </div>
                <RemoteDebug
                  data={data}
                  state={state}
                  progress={progressState}
                  onClose={() => setOpenDebug(false)}
                />
              </div>,
              document.body,
            )
          ) : (
            <XModal
              mask={false}
              title={debugHeader}
              open={openDebug}
              onClose={() => setOpenDebug(false)}
              footer={false}
              width={400}
              noPadding
            >
              <RemoteDebug
                data={data}
                state={state}
                progress={progressState}
                onClose={() => setOpenDebug(false)}
              />
            </XModal>
          ))}
        {takeOffOpen && (
          <FormModal
            localInitialValues={{ key: 'uav_takeoff' }}
            title={`${t('device.uavDock.takeoffForm.title')} ALT(m)`}
            open={takeOffOpen}
            items={items}
            onClose={setTakeoffFalse}
            onConfirm={handleTakeoffOk}
            confirmLoading={state.modeCode !== 0}
          />
        )}
      </div>
    )
  },
)

UavAirportDetail.displayName = 'UavAirportDetail'

export default UavAirportDetail
