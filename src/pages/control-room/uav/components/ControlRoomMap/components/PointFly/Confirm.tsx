import PositionTooltip from '@/components/map/PostionTooltip'
import FormModal from '@/components/XForm/Modal'
import usePostDeviceService from '@/pages/right/DeviceDetail/hooks/usePostDeviceService'
import { usePostDeviceServiceHandler } from '@/hooks/device/usePostDeviceService'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { getSpaceDistance } from '@/utils/geo-math'
import { InfoCircleOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import useQueryDeviceDetail from '@/hooks/device/useQueryDeviceDetail'

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

  const postService = usePostDeviceService()

  // 获取父设备的详情信息
  const parentId = useDeviceDetailStore((s) => s.deviceDetail?.parentId)
  const { data: parentDeivceDetail } = useQueryDeviceDetail(parentId)

  const postServiceHandler = usePostDeviceServiceHandler()

  const [
    paramsOpen,
    { setTrue: setParamsOpenTrue, setFalse: setParamsOpenFalse },
  ] = useBoolean(false)

  const links = useUavControlRoomStore((s) => s.links)

  const handleConfirm = async (data) => {
    try {
      if (
        parentDeivceDetail &&
        links.some((e) => e.name.toUpperCase() === 'DRC')
      ) {
        // 调用父设备的 gotoPosition 服务
        await postServiceHandler(
          parentDeivceDetail.deviceModel.productKey,
          parentDeivceDetail.deviceModel.deviceId,
          'gotoPosition',
          {
            longitude: position[0],
            latitude: position[1],
            ...data,
          },
        )
      } else {
        // 调用本设备的 gotoPosition 服务
        await postService('gotoPosition', {
          longitude: position[0],
          latitude: position[1],
          ...data,
        })
      }
      // 关闭确认框
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
            <Button
              size="small"
              type="primary"
              onClick={setParamsOpenTrue}
              loading={!!(parentId && !parentDeivceDetail)}
            >
              {t('controlRoom.uav.service.tapToFly.title')}
            </Button>
          </p>
        </div>
      </PositionTooltip>
      {paramsOpen && (
        <FormModal
          title={t('controlRoom.uav.service.tapToFly.title')}
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
            {
              label: t('device.uav.takeoffForm.goHomeAltitude.title'),
              name: 'gohomeAltitude',
              type: 'input-number',
              otherProps: { addonAfter: 'm', min: 50, max: 500 },
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
