import PositionTooltip from '@/components/map/PostionTooltip'
import FormModal from '@/components/XForm/Modal'
import { usePostDeviceService } from '@/hooks/device/usePostDeviceService'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { getSpaceDistance } from '@/utils/geo-math'
import { InfoCircleOutlined } from '@ant-design/icons'
import { Button } from 'antd'

type PropsType = {
  position: [number, number]
}

const UavPointFlyConfirm: FC<PropsType> = memo(({ position }) => {
  const uavLon = useUavControlRoomStore((s) => s.state.longitude)
  const uavLat = useUavControlRoomStore((s) => s.state.latitude)
  const speed = useUavControlRoomStore((s) => s.flyParams.flySpeed)

  const updatePointFly = useUavControlRoomStore((s) => s.updatePointFly)

  const { t } = useTranslation()

  const distance = useMemo(() => {
    if (!uavLon || !uavLat) {
      return 0
    }
    return getSpaceDistance([
      [uavLon, uavLat],
      [position[0], position[1]],
    ])
  }, [uavLon, uavLat, position])

  const predicateTime = distance / speed / 60

  const deviceId = useDeviceDetailStore((s) => s.deviceId)
  const productKey = useDeviceDetailStore((s) => s.productKey)
  const postService = usePostDeviceService(productKey, deviceId)

  const [
    paramsOpen,
    { setTrue: setParamsOpenTrue, setFalse: setParamsOpenFalse },
  ] = useBoolean(false)

  const handleConfirm = async (data) => {
    try {
      await postService('gotoPosition', {
        longitude: position[0],
        latitude: position[1],
        ...data,
      })
      updatePointFly({
        open: false,
        targetPosition: null,
      })
    } finally {
      setParamsOpenFalse()
    }
  }

  return (
    <>
      <PositionTooltip offset={[0, 30]} position={position} alwayInViewport>
        <div className="flex flex-col gap-1 text-fore p-1">
          <p className="flex justify-between">
            {t('controlRoom.uav.pointFlyForecast.distance.title')}:{' '}
            <span>
              {distance > 1_000
                ? `${(distance / 1_000).toFixed(1)} km`
                : `${distance.toFixed(1)} m`}
            </span>
          </p>
          <p className="flex justify-between">
            {t('controlRoom.uav.pointFlyForecast.time.title')}:{' '}
            <span>{predicateTime.toFixed(1)} min</span>
          </p>
          <p>
            <InfoCircleOutlined className="text-orange-400" />{' '}
            {t('controlRoom.uav.pointFlyForecast.confirm.msg')}
          </p>
          <p className="flex justify-between">
            <Button
              size="small"
              onClick={() => {
                updatePointFly({
                  open: false,
                  targetPosition: null,
                })
              }}
            >
              {t('modal.cancel')}
            </Button>
            <Button size="small" type="primary" onClick={setParamsOpenTrue}>
              {t('controlRoom.uav.service.tapToFly')}
            </Button>
          </p>
        </div>
      </PositionTooltip>
      {paramsOpen && (
        <FormModal
          title={t('controlRoom.uav.service.tapToFly')}
          initialValues={{
            height: 200,
            speed: 10,
          }}
          items={[
            {
              label: t('controlRoom.uav.targetAltitude.title'),
              name: 'height',
              type: 'input-number',
              rules: [
                {
                  required: true,
                  message: t(
                    'controlRoom.uav.pointFlyForecast.targetHeight.required_msg',
                  ),
                },
              ],
              otherProps: { addonAfter: 'm' },
            },
            {
              label: t('common.flightSpeed'),
              name: 'speed',
              type: 'input-number',
              rules: [
                {
                  required: true,
                  message: t(
                    'controlRoom.uav.pointFlyForecast.flightSpeed.required_msg',
                  ),
                },
              ],
              otherProps: { addonAfter: 'm/s', max: 15, min: 1 },
            },
          ]}
          onClose={setParamsOpenFalse}
          onConfirm={handleConfirm}
        />
      )}
    </>
  )
})

UavPointFlyConfirm.displayName = 'UavPointFlyConfirm'

export default UavPointFlyConfirm
