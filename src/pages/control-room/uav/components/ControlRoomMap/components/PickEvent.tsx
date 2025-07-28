import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import { Dropdown, MenuProps } from 'antd'
import DeviceIcon from '@/components/device/DeviceIcon'
import useRightMode from '@/store/layout/useRightMode.store'
import { RightModeEnum } from '@/enum/right-mode'
import { useUavControlRoomLayoutStore } from '../../../hooks/useUavControlRoomLayout.store'

type PropsType = unknown

type SelectOptionType =
  | {
      kind: 'device'
      type: string
      name: string
      id: string
      lng: number
      lat: number
    }
  | {
      kind: 'radartarget'
      type: string
      targetId: string
      id: string
      name: string
      targetPitch: string
      targetYaw: string
      parentId: string
      deviceId: string
      sourceType: string
      index: string
      uploadMode?: 'TIANLANG'
    }

/** 全局选择 实体 */
const PickEvent: FC<PropsType> = memo(() => {
  const viewer = useCesium()

  const divRef = useRef<HTMLDivElement>(null)
  const [selectOptions, setSelectOptions] = useState<SelectOptionType[]>([])
  const [open, setOpen] = useState(false)
  const updateRightMode = useRightMode((s) => s.updateRightMode)
  const updateDetailId = useRightMode((s) => s.updateDetailId)

  const activeOrAppendTabAfterTab = useUavControlRoomLayoutStore(
    (s) => s.activeOrAppendTabAfterTab,
  )
  const updateEventId = useUavControlRoomLayoutStore((s) => s.updateEventId)

  /** 选择事件 (下拉选择, 一个时选择) */
  const handleSelect = useMemoizedFn((e: SelectOptionType | any) => {
    switch (e.kind) {
      // case 'device':
      //   updateRightMode(RightModeEnum.DEVICE)
      //   updateDetailId(e.id)
      //   break
      case 'radartarget':
        // updateRightMode(RightModeEnum.RADAR_TARGET)
        // updateDetailId(`${e.parentId}=${e.deviceId}=${e.targetId}`)

        break
      case 'event':
        const overlayTab = {
          key: 'event',
          closeable: true,
        }
        activeOrAppendTabAfterTab(overlayTab)
        updateEventId(e.id)
        break
    }
    clearOptions()
  })

  const items = useMemo<MenuProps['items']>(() => {
    return selectOptions.map((e) => ({
      key: e.id,
      label: (
        <p className="flex gap-2">
          {e.kind === 'device' && <DeviceIcon type={e.type} />}
          {e.name}
        </p>
      ),
      onClick: () => handleSelect(e),
    }))
  }, [selectOptions])

  /** 关闭和清空选项 */
  const clearOptions = useMemoizedFn(() => {
    if (open === true) {
      setSelectOptions([])
      setOpen(false)
      setRightMenuType(null)
    }
  })

  const runDevice = (e) => {
    const [kind, type, name, id, lng, lat] = e.primitive.id.split('--')
    return {
      kind,
      type,
      name,
      id,
      lng: parseFloat(lng),
      lat: parseFloat(lat),
    }
  }

  const runEvent = (e) => {
    // `event--${eventType}--${data.deviceName}--${eventId}--${longitude}--${latitude}`
    const [kind, type, name, id, lng, lat] = e.primitive.id.split('--')
    return {
      kind,
      type,
      name,
      id,
      lng: parseFloat(lng),
      lat: parseFloat(lat),
    }
  }

  const runkind = (e) => {
    const [kind] = e.primitive.id.split('--')
    if (kind === 'device') {
      return runDevice(e)
    } else if (kind === 'event') {
      return runEvent(e)
    }
  }

  const [rightMenuType, setRightMenuType] = useState<SelectOptionType | null>()

  useEffect(() => {
    if (!viewer?.scene) {
      return
    }
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)

    handler.setInputAction(
      (evt: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
        if (!viewer?.scene) {
          return
        }
        const pickedObjs = viewer.scene.drillPick(evt.position)
        if (!pickedObjs || !pickedObjs.length) {
          return
        }

        const res = pickedObjs
          .filter(
            (e) =>
              (e.primitive instanceof Cesium.Billboard ||
                e.primitive instanceof Cesium.PointPrimitive) &&
              e.id &&
              typeof e.id === 'string' &&
              (e.id.includes('device--') ||
                // e.id.includes('radartarget--') ||
                e.id.includes('event--')),
          )
          .slice(0, 8) // 限制 8 个
          .map((e) => {
            return runkind(e)
          })
          .filter((item) => !!item)

        // 只有 1 个时, 直接选择
        if (res.length === 1) {
          handleSelect(res[0])
          return
        }
        setSelectOptions(res)
        const position = evt.position
        const { x, y } = viewer.scene.canvas.getBoundingClientRect()
        if (divRef.current !== null) {
          divRef.current.style.left = `${x + 5 + position.x}px`
          divRef.current.style.top = `${y + 5 + position.y}px`
        }

        setTimeout(() => {
          setOpen(true)
          divRef.current?.click()
        })
      },
      Cesium.ScreenSpaceEventType.LEFT_CLICK,
    )

    handler.setInputAction(clearOptions, Cesium.ScreenSpaceEventType.LEFT_DOWN)
    handler.setInputAction(clearOptions, Cesium.ScreenSpaceEventType.WHEEL)

    // handler.setInputAction(
    //   listenRightClick,
    //   Cesium.ScreenSpaceEventType.RIGHT_CLICK,
    // )

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
        return false
      })

      const id = res?.id?.id ?? res?.id
      if (typeof id === 'string' && id.startsWith('overlay--')) {
        const [, overlayId] = id.split('--')
        updateRightMode(RightModeEnum.OVERLYA_DETAIL)
        updateDetailId(overlayId)
      }
    }
    handler.setInputAction(
      handleDoubleClick,
      Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK,
    )

    return () => {
      handler.destroy()
    }
  }, [viewer])

  return (
    <>
      {/** 设备清单 */}
      <Dropdown
        open={open}
        trigger={['click']}
        menu={{
          items: items,
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
    </>
  )
})

PickEvent.displayName = 'CesiumGlobalClickEvent'

export default PickEvent
