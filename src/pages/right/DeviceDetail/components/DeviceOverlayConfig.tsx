import IconPlus from '@/assets/icons/jsx/IconPlus'
import OverlayStyleEditor from '@/pages/right/right-tools/AddGeometry/OverlayStyleEditor'
import useMapDrawStore, { DrawType } from '@/store/map/useDraw.store'
import { Button } from 'antd'
import { createPortal } from 'react-dom'
import { useDeviceDetailStore } from '../hooks/useDeviceDetail.store'
import useDeviceOverlaiesStore from '@/store/map/useDeviceOverlays.store'
import { emtpyArray } from '@/constant/data'
import IconDelete from '@/assets/icons/jsx/IconDelete'
import { deleteDeviceOverlay } from '@/service/modules/device-zone'
import IconAsyncButton from '@/components/ui/button/IconButton/IconAsyncButton'
import IconButton from '@/components/ui/button/IconButton'
import IconEdit from '@/assets/icons/jsx/IconEdit'
import useRightMode from '@/store/layout/useRightMode.store'
import { RightModeEnum } from '@/enum/right-mode'
import useGlobalWsStore from '@/store/useGlobalWebSocket.store'

type PropsType = unknown

/** 设备标绘配置 */
const DeviceOverlayConfig: FC<PropsType> = memo(() => {
  const { t } = useTranslation()

  const deviceId = useDeviceDetailStore((s) => s.deviceId)

  const cancelDraw = () => {
    const sto = useMapDrawStore.getState()
    sto.updateIsDrawingDeviceArea(false)
    sto.updateBindingDeviceId('')
    sto.updateDrawing(DrawType.None)
    sto.updateDevicePosition(null)
  }

  useEffect(() => () => cancelDraw(), [])

  const deviceOverlays = useDeviceOverlaiesStore(
    (s) => s.deviceOverlays[deviceId] ?? emtpyArray,
  )

  const queryClient = useQueryClient()

  const isCreating = useMapDrawStore((s) => s.isDrawingDeviceArea)

  return (
    <>
      <div>
        <ul>
          {deviceOverlays.map((e) => (
            <li key={e.spaceId} className="flex items-center justify-between">
              <div>{e.overlayName}</div>
              <div className="flex gap-2">
                <IconButton
                  toolTipProps={{ title: t('common.edit') }}
                  onClick={() => {
                    const sto = useRightMode.getState()
                    sto.updateRightMode(RightModeEnum.DEVICE_OVERLAY_DETAIL)
                    sto.updateDetailId(e.overlayId + '')
                  }}
                >
                  <IconEdit />
                </IconButton>
                <IconAsyncButton
                  toolTipProps={{ title: t('common.delete') }}
                  onClick={async () => {
                    await deleteDeviceOverlay([e.overlayId])
                    await queryClient.invalidateQueries({
                      queryKey: ['getDeviceOverlayList'],
                    })
                  }}
                >
                  <IconDelete />
                </IconAsyncButton>
              </div>
            </li>
          ))}
        </ul>
        {deviceOverlays.length > 0 ? null : !isCreating ? (
          <Button
            block
            type="primary"
            icon={<IconPlus />}
            onClick={() => {
              const sto = useMapDrawStore.getState()
              sto.updateIsDrawingDeviceArea(true)
              sto.updateIsFlightArea(false)
              sto.updateBindingDeviceId(deviceId)
              sto.updateDrawing(DrawType.Polygon)
              // 更新中心点 (主要用于圆形)
              const properties =
                useGlobalWsStore.getState().deviceRealtimeProperties[deviceId]
                  ?.properties ?? {}
              const { longitude, latitude } = properties
              sto.updateDevicePosition([longitude, latitude])
            }}
          >
            创建可飞行区域
          </Button>
        ) : (
          <Button block onClick={cancelDraw}>
            取消创建
          </Button>
        )}
      </div>
      {isCreating &&
        createPortal(
          <OverlayStyleEditor isCreate />,
          document.querySelector('#global-map')!,
        )}
    </>
  )
})

DeviceOverlayConfig.displayName = 'DeviceOverlayConfig'

export default DeviceOverlayConfig
