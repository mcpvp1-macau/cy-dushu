import DeviceLiveVideo from '@/components/VideoS/DeviceLiveVideo'
import { useDeviceDetailStore } from '../../hooks/useDeviceDetail.store'
import { Button } from 'antd'
import { Link } from 'react-router-dom'
import IconControlRoom from '@/assets/icons/jsx/IconControlRoom'
import AppCollapse from '@/components/AppCollapse'
import AppViewSuspense from '@/components/AppViewSuspense'
import { DeviceEnum } from '@/enum/device'
import { lazy } from 'react'

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

  return (
    <div>
      <div className="mx-3">
        <DeviceLiveVideo
          leftTop={t('common.live')}
          deviceId={deviceId}
          productKey={productKey}
          videoId={videoId}
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
