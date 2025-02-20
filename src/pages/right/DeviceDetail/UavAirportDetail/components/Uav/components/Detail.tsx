import { lazy } from 'react'
import UavFlyInfoCard from './FlyInfoCard'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import UavAirportUavDetailInfoCard from './InfoCard'
import UavDetailVideo from '@/pages/right/DeviceDetail/UavDetail/components/Video/UavDetailVideo'
import { Button } from 'antd'
import IconControlRoom from '@/assets/icons/jsx/IconControlRoom'
import AppCollapse from '@/components/AppCollapse'
import { DeviceEnum } from '@/enum/device'
import AppViewSuspense from '@/components/AppViewSuspense'
import { Link } from 'react-router-dom'

const DeviceAlgorithmList = lazy(
  () => import('@/components/device/algorithm/DeviceAlgorithmList'),
)

type PropsType = {
  state: Record<string, any>
}

const UavAirportUavDetailDetail: FC<PropsType> = memo(({ state }) => {
  const data = useDeviceDetailStore((s) => s.deviceDetail)!

  const productKey = data?.productKey || data?.deviceModel!.productKey

  const { t } = useTranslation()

  return (
    <div>
      <section className="mt-3 mx-3">
        <UavFlyInfoCard
          electric={state.electricity}
          horizontalSpeed={state.horizontalSpeed}
          height={state.height}
          homeDistance={state.homeDistance}
        />
      </section>
      <section className="mx-3 mt-3">
        <UavAirportUavDetailInfoCard taskStatus={state.taskStatus} />
      </section>
      <section className="mx-3 mt-3 rounded overflow-hidden">
        <UavDetailVideo
          videoSource={state.videoSource}
          videoQuality={state.videoQuality}
          useLinksSwitch
        />
      </section>
      <section className="mx-3 mt-3">
        <Link to={`/control-room/uav/${data.deviceId}`}>
          <Button block className="h-7" icon={<IconControlRoom />}>
            {t('device.enterControlRoom.title')}
          </Button>
        </Link>
      </section>
      <section className="mt-3">
        <AppCollapse
          items={[
            {
              label: t('device.aiList.title'),
              children: (
                <AppViewSuspense>
                  <DeviceAlgorithmList
                    deviceType={DeviceEnum.UAV}
                    deviceId={data.deviceId}
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

UavAirportUavDetailDetail.displayName = 'UavAirportUavDetailDetail'

export default UavAirportUavDetailDetail
