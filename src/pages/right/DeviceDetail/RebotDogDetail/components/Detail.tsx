import DeviceLiveVideo from '@/components/VideoS/DeviceLiveVideo'
import { useDeviceDetailStore } from '../../hooks/useDeviceDetail.store'
import { Button } from 'antd'
import { Link } from 'react-router-dom'
import IconControlRoom from '@/assets/icons/jsx/IconControlRoom'
import AppCollapse from '@/components/AppCollapse'
import AppViewSuspense from '@/components/AppViewSuspense'
import { DeviceEnum } from '@/enum/device'
import { lazy } from 'react'
import RebotDogInfoCard from './InfoCard'
import { useRealOnlineStatus } from '@/store/useGlobalWebSocket.store'
import { useRebotDogControlRoomStore } from '@/store/context-store/useRebotDogControlRoom.store'

const DeviceAlgorithmList = lazy(
  () => import('@/components/device/algorithm/DeviceAlgorithmList'),
)

const RebotDogDetailDetail: FC<unknown> = memo(() => {
  const { t } = useTranslation()

  const productKey = useDeviceDetailStore((s) => s.productKey)
  const deviceId = useDeviceDetailStore((s) => s.deviceId)
  const videoId = useDeviceDetailStore(
    (s) => s.deviceDetail?.properties.videoList?.[0]?.videoId ?? '',
  )

  const deviceDetail = useDeviceDetailStore((s) => s.deviceDetail)

  const modelNumber =
    deviceDetail?.deviceTags?.find(
      (item: { tagName: string }) => item.tagName === 'MODEL_NUMBER',
    )?.tagValue || '-'

  const status = useRealOnlineStatus(deviceId)

  const lng = useRebotDogControlRoomStore((s) => s.state.longitude)
  const lat = useRebotDogControlRoomStore((s) => s.state.latitude)
  const electricity = useRebotDogControlRoomStore((s) => s.state.electricity)
  const speed = useRebotDogControlRoomStore((s) => s.state.speed)

  return (
    <div>
      <RebotDogInfoCard
        modelNumber={modelNumber}
        onlineStatus={status}
        signalStrength={deviceDetail?.properties.signalStrength}
        electricity={electricity}
        speed={speed}
        longitude={lng}
        latitude={lat}
      />
      <div className="m-3">
        <DeviceLiveVideo
          leftTop={t('common.live')}
          deviceId={deviceId}
          productKey={productKey}
          videoId={videoId}
          useVideoQualityCheck={{ open: true }}
        />
      </div>
      <div className="m-3">
        <Link className="grow" to={`/control-room/rebot-dog/${deviceId}`}>
          <Button block className="h-7" icon={<IconControlRoom />}>
            {t('device.enterControlRoom.title')}
          </Button>
        </Link>
      </div>
      <section className="mt-3">
        <AppCollapse
          items={[
            {
              label: t('device.aiList.title'),
              children: (
                <AppViewSuspense>
                  <DeviceAlgorithmList
                    deviceType={DeviceEnum.ROBOT_DOG}
                    deviceId={deviceId}
                    productKey={productKey}
                  />
                </AppViewSuspense>
              ),
            },
          ]}
        />
      </section>
    </div>
  )
})

RebotDogDetailDetail.displayName = 'RebotDogDetailDetail'

export default RebotDogDetailDetail
