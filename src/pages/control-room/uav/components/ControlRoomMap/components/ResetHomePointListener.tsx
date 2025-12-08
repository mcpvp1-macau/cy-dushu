import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { useAppMsg } from '@/hooks/useAppMsg'
import { setDeviceProp } from '@/service/modules/device'
import { Button } from 'antd'

type PropsType = unknown

/** 重置返航点 */
const ResetHomePointListener: FC<PropsType> = memo(() => {
  const flyParams = useUavControlRoomStore((s) => s.flyParams)
  const updateFlyParams = useUavControlRoomStore((s) => s.updateFlyParams)
  const deviceId = useDeviceDetailStore((s) => s.deviceId)
  const productKey = useDeviceDetailStore((s) => s.productKey)
  const msgApi = useAppMsg()

  const { t } = useTranslation()

  const mutate = useMemoizedFn(async (lon: number, lat: number) => {
    updateFlyParams({ ...flyParams, isResetHome: false })
    try {
      msgApi.open({
        key: 'resetHomePoint',
        type: 'loading',
        content: t('controlRoom.uav.flyParamsSetting.resetingHomePoint.title'),
      })
      await setDeviceProp(productKey, deviceId, {
        gohomeLongitude: lon,
        gohomeLatitude: lat,
      })
    msgApi.open({
      key: 'resetHomePoint',
      type: 'success',
      content: t(
        'controlRoom.uav.flyParamsSetting.resetingHomePoint.success',
      ),
    })
  } catch (_error) {
    msgApi.destroy('resetHomePoint')
  }
})

  const { viewer } = useCesium()

  useEffect(() => {
    if (!flyParams.isResetHome || !viewer) {
      return
    }
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
    handler.setInputAction(
      (e: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
        const cartesian = viewer.scene.pickPosition(e.position)
        if (!cartesian) {
          return
        }
        // 经纬度
        const cartographic = Cesium.Cartographic.fromCartesian(cartesian)
        const longitude = Cesium.Math.toDegrees(cartographic.longitude)
        const latitude = Cesium.Math.toDegrees(cartographic.latitude)
        if (longitude || latitude) {
          mutate(longitude, latitude)
        }
      },
      Cesium.ScreenSpaceEventType.LEFT_CLICK,
    )

    return () => {
      handler.destroy()
    }
  }, [flyParams.isResetHome])

  return (
    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 bg-ground-3 text-white p-3 rounded bg-opacity-50 flex items-center gap-3 whitespace-nowrap">
      {t('controlRoom.uav.flyParamsSetting.resetingHomePoint.clickMapMsg')}
      <Button
        size="small"
        type="primary"
        danger
        onClick={() => {
          updateFlyParams({
            ...flyParams,
            isResetHome: false,
          })
        }}
      >
        {t('common.cancel')}
      </Button>
    </div>
  )
})

ResetHomePointListener.displayName = 'ResetHomePointListener'

export default ResetHomePointListener
