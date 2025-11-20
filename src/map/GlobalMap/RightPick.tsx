import AreaDetectModal from '@/components/AreaDetectModal'
import { useAppMsg } from '@/hooks/useAppMsg'
import situation from '@/router/modules/situation'
import { Dropdown, MenuProps } from 'antd'
import * as Cesium from 'cesium'
import { useCesium } from 'resium'
import { useMatches } from 'react-router-dom'

type PropsType = unknown

type CenterPoint = {
  lng: number
  lat: number
}

const RightPick: FC<PropsType> = memo(() => {
  const { viewer } = useCesium()
  const matches = useMatches()
  const canUse = useMemo(
    () => !!matches.find((match) => match.id === situation.id),
    [matches],
  )
  const msgApi = useAppMsg()
  const params = useParams()
  const actionId = useMemo(() => {
    if (!params.actionId) {
      return undefined
    }
    const id = Number(params.actionId)
    return Number.isNaN(id) ? undefined : id
  }, [params.actionId])

  const divRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [pendingCenter, setPendingCenter] = useState<CenterPoint | null>(null)
  const [modalCenter, setModalCenter] = useState<CenterPoint | null>(null)

  const closeDropdown = useMemoizedFn(() => {
    if (open) {
      setOpen(false)
    }
  })

  useEffect(() => {
    if (!viewer || !canUse) {
      return
    }

    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)

    handler.setInputAction(
      (evt: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
        const cartesian = pickPosition(viewer, evt.position)
        if (!cartesian) {
          msgApi.error('未获取到点击位置，请重试')
          return
        }
        const cartographic = Cesium.Cartographic.fromCartesian(cartesian)
        const lng = Cesium.Math.toDegrees(cartographic.longitude)
        const lat = Cesium.Math.toDegrees(cartographic.latitude)
        setPendingCenter({ lng, lat })

        const rect = viewer.scene.canvas.getBoundingClientRect()
        if (divRef.current) {
          divRef.current.style.left = `${rect.left + evt.position.x}px`
          divRef.current.style.top = `${rect.top + evt.position.y}px`
        }

        setTimeout(() => {
          setOpen(true)
          divRef.current?.click()
        })
      },
      Cesium.ScreenSpaceEventType.RIGHT_CLICK,
    )

    handler.setInputAction(closeDropdown, Cesium.ScreenSpaceEventType.LEFT_DOWN)
    handler.setInputAction(closeDropdown, Cesium.ScreenSpaceEventType.WHEEL)

    return () => {
      handler.destroy()
    }
  }, [viewer, canUse, closeDropdown, msgApi])

  useEffect(() => {
    if (!canUse) {
      closeDropdown()
    }
  }, [canUse, closeDropdown])

  const handleAreaDetectClick = useMemoizedFn(() => {
    if (!pendingCenter) {
      msgApi.error('未获取到点击位置，请重试')
      return
    }
    setModalCenter(pendingCenter)
    setModalOpen(true)
    closeDropdown()
  })

  const items = useMemo<MenuProps['items']>(
    () => [
      {
        key: 'area-detect',
        label: '区域侦查',
        onClick: handleAreaDetectClick,
      },
    ],
    [handleAreaDetectClick],
  )

  return (
    <>
      {canUse && (
        <Dropdown
          open={open}
          trigger={['click']}
          menu={{
            items,
          }}
        >
          <div
            style={{
              position: 'fixed',
              width: '1px',
              height: '1px',
              left: '-1000px',
              top: '-1000px',
              display: open ? 'block' : 'none',
            }}
            ref={divRef}
          />
        </Dropdown>
      )}
      <AreaDetectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        center={modalCenter}
        actionId={actionId}
      />
    </>
  )
})

const pickPosition = (viewer: Cesium.Viewer, position: Cesium.Cartesian2) => {
  if (!viewer.scene) {
    return null
  }
  let cartesian: Cesium.Cartesian3 | undefined
  const ray = viewer.camera.getPickRay(position)
  if (ray) {
    cartesian = viewer.scene.globe.pick(ray, viewer.scene) ?? undefined
  }
  if (!cartesian) {
    if (viewer.scene.pickPositionSupported) {
      cartesian = viewer.scene.pickPosition(position)
    }
  }
  if (!cartesian) {
    return null
  }
  return cartesian
}

RightPick.displayName = 'RightPick'

export default RightPick
