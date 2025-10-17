import PositionTooltip from '@/components/map/PositionTooltip'
import FormModal from '@/components/XForm/Modal'
import usePostDeviceService from '@/pages/right/DeviceDetail/hooks/usePostDeviceService'
import { usePostDeviceServiceHandler } from '@/hooks/device/usePostDeviceService'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { getSpaceDistance } from '@/utils/geo-math'
import { InfoCircleOutlined, WarningOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import useMapDevicesStore from '@/store/map/useMapDevices.store'
import useFlightAreaStore from '@/store/map/useFlightArea.store'
import * as turf from '@turf/turf'
import { shouldJson } from '@/utils/json'

type PropsType = {
  position: [number, number, number]
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
  const parentDeivceDetail = useMapDevicesStore(
    (s) => s.deviceMap[parentId ?? 'never'],
  )

  const flightAreaList = useFlightAreaStore((s) => s.flightAreaList)

  const noFlyZones = useMemo(
    () =>
      flightAreaList
        .filter(
          (e) =>
            e.overlayExtType === 'NO_FLY_ZONE' &&
            ['POLYGON', 'CIRCULAR'].includes(e.overlayType),
        )
        .map((e) => {
          const positions = shouldJson(e.overlayPositions)
          if (e.overlayType === 'POLYGON') {
            const polygon = turf.polygon([
              [...positions, positions[0]].map((p) => [p[0], p[1]]),
            ])
            return polygon
          }
          const circle = turf.circle(
            [positions[0][0], positions[0][1]],
            positions[0][3],
            { units: 'meters', steps: 64 },
          )
          return circle
        }),
    [flightAreaList],
  )
  const crossNoFlyZones = useMemo(() => {
    if (!uavLon || !uavLat) {
      return false
    }
    const line = turf.lineString([
      [uavLon, uavLat],
      [position[0], position[1]],
    ])
    return noFlyZones.some((zone) => turf.booleanIntersects(zone, line))
  }, [noFlyZones, position, uavLon, uavLat])

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
        !links.some((e) => e.name.toUpperCase() === '5G')
      ) {
        // 调用父设备的 gotoPosition 服务
        await postServiceHandler(
          parentDeivceDetail.productKey,
          parentDeivceDetail.deviceId,
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
        <div className="p-2 flex flex-col gap-1 text-fore">
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
          {crossNoFlyZones && (
            <p className="text-red-400">
              <WarningOutlined />{' '}
              {t('controlRoom.uav.pointFlyForecast.crossNoFlyZones.msg')}
            </p>
          )}
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
              otherProps: {
                addonAfter: <div className="px-1">m</div>,
                min: 1,
                max: globalConfig.uavHeightLimit,
              },
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
              otherProps: {
                addonAfter: <div className="px-1">m/s</div>,
                max: 15,
                min: 1,
              },
            },
            {
              label: t('device.uav.takeoffForm.goHomeAltitude.title'),
              name: 'gohomeAltitude',
              type: 'input-number',
              otherProps: {
                addonAfter: <div className="px-1">m</div>,
                min: 50,
                max: globalConfig.uavHeightLimit,
              },
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
