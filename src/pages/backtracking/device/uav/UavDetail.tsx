import DeviceIconUAV from '@/assets/icons/jsx/device/DeviceIconUAV'
import { memo, type FC } from 'react'
import UavDetailInfoCard from './InfoCard'
import HealthInfoMini from '@/components/device/HealthInfoMini'
import BackTrackingVideo from '../BackTrackingVideo'
import { Link } from 'react-router-dom'
import { Button } from 'antd'
import IconControlRoom from '@/assets/icons/jsx/IconControlRoom'
import IconButton from '@/components/ui/button/IconButton'
import IconClose from '@/assets/icons/jsx/IconClose'
import SegmentTitle from '@/components/ui/SegmentTitle'
import UAVFlightSchedule from './UAVFlightSchedule'
import AppCollapse from '@/components/AppCollapse'

type PropsType = {
  data: API_DEVICE.domain.Device
  state: Record<string, any>
  updateTime: string
  onClose?: () => void
}

const UavBackTrackingDetail: FC<PropsType> = memo(
  ({ data, state, updateTime, onClose }) => {
    const { t } = useTranslation()

    return (
      <div className="w-[350px]">
        <div className="flex justify-between px-3 my-2">
          <div className="flex gap-2 items-center">
            <DeviceIconUAV className="device-detail-icon" />
            <h6 className="text-hightlight text-base">{data.deviceName}</h6>
            {state.healthInfo?.length > 0 && (
              <HealthInfoMini healthInfo={state.healthInfo} />
            )}
          </div>
          {onClose ? (
            <div className="flex gap-2 items-center">
              <IconButton className="text-xl" onClick={onClose}>
                <IconClose />
              </IconButton>
            </div>
          ) : null}
        </div>
        <div className="overflow-y-auto max-h-[calc(100vh-240px)]">
          <div className="my-2">
            <UavDetailInfoCard
              operator={state.operator}
              signalStrength={state.signalStrength}
              displayMode={state.displayMode}
              electricity={state.electricity}
              longitude={state.longitude}
              latitude={state.latitude}
              height={state.height}
              horizontalSpeed={state.horizontalSpeed}
            />
          </div>
          <div className="my-2">
            <BackTrackingVideo
              productKey={data.deviceModel.productKey}
              deviceId={data.deviceId}
              videoId={
                state.videoList?.[0]?.videoId ||
                data.properties?.videoList?.[0]?.videoId
              }
            />
          </div>
          <div className="my-2 px-3 text-xs text-center"></div>
          <section className="mx-3 my-3 flex gap-2">
            <Link
              className="grow"
              to={`/backtracking/control-room/uav/${data.deviceId}`}
            >
              <Button block className="h-7" icon={<IconControlRoom />}>
                {t('device.enterControlRoom.title')}
              </Button>
            </Link>
          </section>
          <SegmentTitle
            className="px-3 mb-3 text-sm"
            title={'数据采集时间: ' + updateTime}
          />
          <AppCollapse
            items={[
              {
                label: '飞行架次',
                children: <UAVFlightSchedule />,
              },
            ]}
          />
        </div>
      </div>
    )
  },
)

UavBackTrackingDetail.displayName = 'UavBackTrackingDetail'

export default UavBackTrackingDetail
