import CameraDetailInfoCard from './CameraDetailInfoCard'
import { useDeviceDetailStore } from '../../hooks/useDeviceDetail.store'
import ControlBar from '../../OthersDetail/components/Control/ControlBar'

import { useOthersControlRoomStore } from '@/store/context-store/useOthersControlRoom.store'
import { useRafInterval } from 'ahooks'
import AppCollapse from '@/components/AppCollapse'
import AppViewSuspense from '@/components/AppViewSuspense'
import ZoomControl from './ZoomControl'
import CameraConfig from './CameraConfig'
import { ScrollArea } from '@/components/ui/scroll-area'
import useMapDevicesStore from '@/store/map/useMapDevices.store'
import CameraDetailVideo from './CameraDetailVideo'
import DeviceAlgorithmList from '@/components/device/algorithm/DeviceAlgorithmList'
import { DeviceEnum } from '@/enum/device'

type PropsType = unknown

const speed = 90

const CameraDetailDetail: FC<PropsType> = memo(() => {
  const [t] = useTranslation()
  const deviceDetail = useDeviceDetailStore((s) => s.deviceDetail)!

  const deviceId = deviceDetail.deviceId
  const productKey = deviceDetail.deviceModel.productKey

  const services = deviceDetail.deviceModel?.services

  const modelName =
    deviceDetail.deviceTags?.find(
      (item: { tagName: string }) => item.tagName === 'MODEL_NUMBER',
    )?.tagValue || '-'

  const isHaveGimbal = !!services?.['moveGimbal']

  const [downKey, setDownKey] = useState<Record<string, number> | null>(null)
  const [zoom, setZoom] = useState<Record<
    string,
    number | string | undefined
  > | null>(null)

  const sendCommand = useOthersControlRoomStore((s) => s.sendCommand)

  useRafInterval(
    () => {
      sendCommand('service.moveGimbal.post', downKey)
    },
    downKey ? 60 : undefined,
  )

  useRafInterval(
    () => {
      sendCommand('service.liveZoomChange.post', zoom)
    },
    zoom ? 60 : undefined,
  )

  useEffect(() => {
    const updateCameraInDetail =
      useMapDevicesStore.getState().updateCameraInDetail

    const cameraInDetail = useMapDevicesStore.getState().cameraInDetail
    const next = new Set(cameraInDetail)
    next.add(deviceId)
    updateCameraInDetail(new Set(next))

    return () => {
      const cameraInDetail = useMapDevicesStore.getState().cameraInDetail
      const next = new Set(cameraInDetail)
      next.delete(deviceId)
      updateCameraInDetail(next)
    }
  }, [])

  return (
    <ScrollArea className="flex-1">
      <section className="mx-3">
        <CameraDetailInfoCard
          modelNumber={modelName}
          onlineStatus={deviceDetail.status}
          longitude={deviceDetail.longitude}
          latitude={deviceDetail.latitude}
        />
      </section>
      <section className="mx-3 my-3">
        <CameraDetailVideo />
      </section>
      <AppCollapse
        className="border-x-0 border-b-0"
        defaultActiveKey={['status']}
        items={[
          ...(isHaveGimbal
            ? [
                {
                  label: '云台控制',
                  key: 'status',
                  children: (
                    <AppViewSuspense>
                      <div className="flex justify-center my-3 items-center gap-10">
                        <ControlBar speed={speed} setDownKey={setDownKey} />
                        <ZoomControl item={deviceDetail} setZoom={setZoom} />
                      </div>
                    </AppViewSuspense>
                  ),
                },
              ]
            : []),
          {
            label: t('device.aiModel.title'),
            children: (
              <AppViewSuspense>
                <DeviceAlgorithmList
                  deviceType={DeviceEnum.CAMERA}
                  deviceId={deviceId}
                  productKey={productKey!}
                />
              </AppViewSuspense>
            ),
          },
          {
            label: '设备配置',
            key: 'config',
            children: (
              <AppViewSuspense>
                <CameraConfig />
              </AppViewSuspense>
            ),
          },
        ].filter((item) => !!item)}
      />
    </ScrollArea>
  )
})

CameraDetailDetail.displayName = 'CameraDetailDetail'

export default CameraDetailDetail
