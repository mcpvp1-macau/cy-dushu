import IconPlus from '@/assets/icons/jsx/IconPlus'
import OverlayStyleEditor from '@/pages/right/right-tools/AddGeometry/OverlayStyleEditor'
import useMapDrawStore, { DrawType } from '@/store/map/useDraw.store'
import { Button } from 'antd'
import { createPortal } from 'react-dom'
import { useDeviceDetailStore } from '../../hooks/useDeviceDetail.store'
import useDeviceOverlaiesStore from '@/store/map/useDeviceOverlays.store'
import { emtpyArray } from '@/constant/data'
import IconDelete from '@/assets/icons/jsx/IconDelete'
import { deleteDeviceOverlay } from '@/service/modules/device-zone'
import IconAsyncButton from '@/components/ui/button/IconButton/IconAsyncButton'

type PropsType = unknown

const DeviceOverlayFlightArea: FC<PropsType> = memo(() => {
  const deviceId = useDeviceDetailStore((s) => s.deviceId)

  const cancelDraw = () => {
    const sto = useMapDrawStore.getState()
    sto.updateIsDrawingDeviceArea(false)
    sto.updateBindingDeviceId('')
    sto.updateDrawing(DrawType.None)
  }

  useEffect(() => () => cancelDraw(), [])

  const deviceOverlays = useDeviceOverlaiesStore(
    (s) => s.deviceOverlays[deviceId] ?? emtpyArray,
  )

  const queryClient = useQueryClient()

  const isCreating = useMapDrawStore((s) => s.isDrawingDeviceArea)

  return (
    <>
      <div className="p-3">
        <ul>
          {deviceOverlays.map((e) => (
            <li key={e.spaceId} className="flex items-center justify-between">
              <div>{e.overlayName}</div>
              <IconAsyncButton
                onClick={async () => {
                  await deleteDeviceOverlay([e.overlayId])
                  await queryClient.invalidateQueries({
                    queryKey: ['getDeviceOverlayList'],
                  })
                }}
              >
                <IconDelete />
              </IconAsyncButton>
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
              useMapDrawStore.getState().updateDrawing(DrawType.Polygon)
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

DeviceOverlayFlightArea.displayName = 'DeviceOverlayFlightArea'

export default DeviceOverlayFlightArea
