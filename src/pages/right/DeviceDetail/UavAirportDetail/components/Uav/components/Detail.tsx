import UavFlyInfoCard from './FlyInfoCard'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import UavAirportUavDetailInfoCard from './InfoCard'
import UavDetailVideo from '@/pages/right/DeviceDetail/UavDetail/components/Video/UavDetailVideo'
import { Button } from 'antd'
import IconControlRoom from '@/assets/icons/jsx/IconControlRoom'
import { Link } from 'react-router-dom'

type PropsType = {
  state: Record<string, any>
}

/** 机场详情中的无人机详情 */
const UavAirportUavDetailDetail: FC<PropsType> = memo(({ state }) => {
  const data = useDeviceDetailStore((s) => s.deviceDetail)!

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
        <UavAirportUavDetailInfoCard />
      </section>
      <section className="mx-3 mt-3 overflow-hidden">
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
    </div>
  )
})

UavAirportUavDetailDetail.displayName = 'UavAirportUavDetailDetail'

export default UavAirportUavDetailDetail
