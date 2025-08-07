import IconControlRoom from '@/assets/icons/jsx/IconControlRoom'
import AppCollapse from '@/components/AppCollapse'
import AppViewSuspense from '@/components/AppViewSuspense'
import ControlPower from '@/components/ControlPower'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { useRealOnlineStatus } from '@/store/useGlobalWebSocket.store'
import { Button } from 'antd'
import { lazy, memo, type FC } from 'react'
import UavDetailVideo from './Video/UavDetailVideo'
import UavDetailInfoCard from './UavInfoCard'
import { DeviceEnum } from '@/enum/device'
import { Link } from 'react-router-dom'

const UavDetailFlightControl = lazy(
  () => import('./UavControlPanel/FlightControl'),
)
const UavDetailGimbalControl = lazy(
  () => import('./UavControlPanel/GimbalControl'),
)
const DeviceAlgorithmList = lazy(
  () => import('@/components/device/algorithm/DeviceAlgorithmList'),
)
const UavConfiguration = lazy(() => import('./UavConfiguration'))

type PropsType = {
  /** 详情数据 */
  data: API_DEVICE.domain.Device
}

const UavDetailDetail: FC<PropsType> = memo(({ data }) => {
  const modelName =
    data.deviceTags?.find(
      (item: { tagName: string }) => item.tagName === 'MODEL_NUMBER',
    )?.tagValue || '-'

  /** 是否道通播放器 */
  const isRtcDemo = !!data.deviceTags?.find(
    (item: any) => item.tagName === 'PLAY_TYPE' && item.tagValue === 'DT_RTC',
  )?.tagValue
  const status = useRealOnlineStatus(data.deviceId)

  const deviceId = data.deviceId
  const productKey = (data.productKey || data.deviceModel?.productKey)!
  const state = useUavControlRoomStore((s) => s.state)
  const displayMode = state.displayMode?.split('￥')?.[0] || '-'

  const controlTag = useUavControlRoomStore((s) => s.state.controlTag)
  const uuid = useUavControlRoomStore((s) => s.uuid)

  const videoSource = useUavControlRoomStore((s) => s.state.videoSource)
  const updateUUID = useUavControlRoomStore((s) => s.updateUUID)

  const { t } = useTranslation()

  return (
    <div>
      <UavDetailInfoCard
        modelNumber={modelName}
        onlineStatus={status}
        signalStrength={state.signalStrength}
        displayMode={displayMode}
        electricity={state.electricity}
        longitude={state.longitude ?? data.longitude}
        latitude={state.latitude ?? data.latitude}
        height={state.height}
        horizontalSpeed={state.horizontalSpeed}
      />

      <section className="m-3 rounded overflow-hidden">
        <UavDetailVideo
          videoSource={videoSource ?? ''}
          sn={isRtcDemo ? data.sn : undefined}
          isInUavDetail
        />
      </section>

      <section className="mx-3 mr-[9px] my-3 flex gap-2">
        <Link className="grow" to={`/control-room/uav/${deviceId}`}>
          <Button block className="h-7" icon={<IconControlRoom />}>
            {t('device.enterControlRoom.title')}
          </Button>
        </Link>
        <ControlPower
          open={!!(uuid && uuid === controlTag)}
          updateUUID={updateUUID}
        />
      </section>
      <AppCollapse
        className="mt-3 border-x-0 border-b-0"
        items={[
          {
            label: t('uav.gimbalControl.title'),
            key: 'gimbal',
            children: (
              <AppViewSuspense>
                <UavDetailGimbalControl />
              </AppViewSuspense>
            ),
          },
          {
            label: t('uav.flightControl.title'),
            key: 'flight',
            children: (
              <AppViewSuspense>
                <UavDetailFlightControl />
              </AppViewSuspense>
            ),
          },
          {
            label: t('device.aiModel.title'),
            children: (
              <AppViewSuspense>
                <DeviceAlgorithmList
                  deviceType={DeviceEnum.UAV}
                  deviceId={deviceId}
                  productKey={productKey!}
                />
              </AppViewSuspense>
            ),
          },
          {
            label: t('common.deviceConfig'),
            children: (
              <AppViewSuspense>
                <UavConfiguration />
              </AppViewSuspense>
            ),
          },
        ]}
        destroyOnHidden
      />
    </div>
  )
})

UavDetailDetail.displayName = 'UavDetailDetail'

export default UavDetailDetail
