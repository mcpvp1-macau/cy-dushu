import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import LayerOverlaies from '@/map/CesiumMap/components/service/Overlaies/Overlaies'
import FlightAreas from '@/map/CesiumMap/components/service/FlightAreas/FlightAreas'
import { useUavControlRoomLayoutStore } from '../../../../hooks/useUavControlRoomLayout.store'
import useMapLayerAndOverlayStore from '@/store/map/useLayerAndOverlay.store'
import { shouldJson } from '@/utils/json'
import PositionMenu from '@/components/map/PositionMenu'
import IconPointFly from '@/assets/icons/jsx/uav/IconPointFly'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { ComponentRef } from 'react'

type PropsType = unknown

/** 图层和点位 */
const LayerOverlay: FC<PropsType> = () => {
  const { t } = useTranslation()

  const { viewer } = useCesium()
  const updateOverlayDetailId = useUavControlRoomLayoutStore(
    (s) => s.updateOverlayDetailId,
  )
  const activeOrAppendTabAfterTab = useUavControlRoomLayoutStore(
    (s) => s.activeOrAppendTabAfterTab,
  )

  const [rightPosition, setRightPosition] = useState<number[] | null>(null)

  const hasControlPower = useUavControlRoomStore((s) => s.hasControlPower)
  const serviceHave = useDeviceDetailStore((s) => s.serviceHave)
  const isLimitedFly = useUavControlRoomStore((s) => s.isLimitedFly)

  const canPointFly =
    !isLimitedFly && hasControlPower && serviceHave['gotoPosition']

  useEffect(() => {
    if (!viewer) {
      return
    }
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas)

    const handleDoubleClick = (evt) => {
      const pickedObjs = viewer?.scene?.drillPick(evt.position)
      if (!pickedObjs || !pickedObjs.length) {
        return
      }

      const res = pickedObjs.find((e) => {
        if (typeof e.id === 'string' && e.id.startsWith('overlay--')) {
          return true
        }
        if (typeof e.id?.id === 'string' && e.id.id.startsWith('overlay--')) {
          return true
        }
        if (
          typeof e.primitive?.props === 'string' &&
          e.primitive.props.startsWith('overlay--')
        ) {
          return true
        }
        return false
      })

      const id = res?.id?.id ?? res?.id ?? res?.primitive?.props

      if (typeof id === 'string' && id.startsWith('overlay--')) {
        const [, overlayId] = id.split('--')
        const overlayTab = {
          key: 'overlay',
          closeable: true,
        }
        activeOrAppendTabAfterTab(overlayTab)
        updateOverlayDetailId(overlayId)
      }

      if (id?.startsWith('flightArea--')) {
        const overlayId = id.slice('flightArea--'.length)
        updateOverlayDetailId(overlayId)
      }
    }

    const handleRightClick: Cesium.ScreenSpaceEventHandler.PositionedEventCallback =
      (evt) => {
        const pickedObjs = viewer?.scene?.drillPick(evt.position)
        if (!pickedObjs || !pickedObjs.length) {
          return
        }

        const res = pickedObjs.find((e) => {
          if (typeof e.id === 'string' && e.id.startsWith('overlay--')) {
            return true
          }
          if (typeof e.id?.id === 'string' && e.id.id.startsWith('overlay--')) {
            return true
          }
          if (
            typeof e.primitive?.props === 'string' &&
            e.primitive.props.startsWith('overlay--')
          ) {
            return true
          }
          return false
        })

        const id = res?.id?.id ?? res?.id ?? res?.primitive?.props

        if (typeof id === 'string' && id.startsWith('overlay--')) {
          const overlayId = Number(id.split('--', 2)[1])
          if (overlayId) {
            const overlay = useMapLayerAndOverlayStore
              .getState()
              .overlayList.find((e) => e.overlayId === overlayId)
            if (overlay?.overlayType === 'POSITION') {
              setRightPosition(shouldJson(overlay.overlayPositions)[0])
              setTimeout(() => menuRef.current?.open())
            }
          }
        }
      }

    handler.setInputAction(
      handleDoubleClick,
      Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK,
    )

    handler.setInputAction(
      handleRightClick,
      Cesium.ScreenSpaceEventType.RIGHT_CLICK,
    )

    return () => {
      handler.destroy()
    }
  }, [viewer])

  const updatePointFly = useUavControlRoomStore((s) => s.updatePointFly)

  const menuRef = useRef<ComponentRef<typeof PositionMenu> | null>(null)

  const handlePointFlyClick = useMemoizedFn(() => {
    updatePointFly({
      open: true,
      targetPosition: [rightPosition![0], rightPosition![1], 0],
    })
    setRightPosition(null)
    menuRef.current?.close()
  })

  return (
    <>
      <LayerOverlaies />
      <FlightAreas />
      <PositionMenu
        ref={menuRef}
        position={rightPosition!}
        onOpenChange={(e) => {
          if (!e) {
            setRightPosition(null)
          }
        }}
        menu={{
          items: [
            {
              label: t('controlRoom.uav.service.tapToFly.title'),
              key: 'position',
              icon: <IconPointFly />,
              disabled: !canPointFly,
              onClick: handlePointFlyClick,
            },
          ],
        }}
      />
    </>
  )
}

export default LayerOverlay
