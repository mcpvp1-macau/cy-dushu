import { memo, type FC } from 'react'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import { Dropdown, MenuProps } from 'antd'
import DeviceIcon from '@/components/device/DeviceIcon'
import useRightMode from '@/store/layout/useRightMode.store'
import { RightModeEnum } from '@/enum/right-mode'
import useMapDevicesStore from '@/store/map/useMapDevices.store'
import { postDeviceService } from '@/service/modules/device'
import { msgMitt } from '@/hooks/useAppMsg'
import useBoardObjStore from '@/store/map/useBoardObj.store'

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
const CesiumGlobalPickEvent: FC<PropsType> = memo(() => {
  const viewer = useCesium()

  const divRef = useRef<HTMLDivElement>(null)
  const [selectOptions, setSelectOptions] = useState<SelectOptionType[]>([])
  const [open, setOpen] = useState(false)
  const updateRightMode = useRightMode((s) => s.updateRightMode)
  const updateDetailId = useRightMode((s) => s.updateDetailId)

  /** 选择事件 (下拉选择, 一个时选择) */
  const handleSelect = useMemoizedFn((e: SelectOptionType | any) => {
    switch (e.kind) {
      case 'device':
        updateRightMode(RightModeEnum.DEVICE)
        updateDetailId(e.id)
        break
      case 'radartarget':
        updateRightMode(RightModeEnum.RADAR_TARGET)
        updateDetailId(`${e.parentId}=${e.deviceId}=${e.targetId}`)
        break
      case 'event':
        updateRightMode(RightModeEnum.EVENT_DETAIL)
        updateDetailId(e.id)
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

  const runTarget = (e) => {
    const [
      kind,
      type,
      targetId,
      targetPitch,
      targetYaw,
      parentId,
      deviceId,
      sourceType,
      index,
      uploadMode,
    ] = e.primitive.id.split('--')
    return {
      kind,
      type,
      id: targetId,
      targetPitch,
      targetYaw,
      parentId,
      deviceId,
      name: targetId,
      targetId,
      sourceType,
      index,
      uploadMode,
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
    } else if (kind === 'radartarget') {
      return runTarget(e)
    } else if (kind === 'event') {
      return runEvent(e)
    }
  }

  const [rightMenuType, setRightMenuType] = useState<SelectOptionType | null>()
  const allDevicesMap = useMapDevicesStore((s) => s.allDevicesMap)

  /** 引导 */
  const handleClick1 = async (parentId, targetId) => {
    const productKey = allDevicesMap[parentId][0]?.productKey
    if (!productKey) return
    const { message } = await postDeviceService(
      productKey,
      parentId,
      'attractByRadar',
      {
        targetId: Number(targetId),
      },
    )
    msgMitt.emit('open', {
      content: message,
    })
    setRightMenuType(null)
  }

  const setBoardOpenMap = useBoardObjStore((s) => s.setBoardOpenMap)

  const RightMenus = useMemo<MenuProps['items']>(() => {
    if (rightMenuType?.kind === 'radartarget') {
      const arr: MenuProps['items'] = []
      if (rightMenuType?.uploadMode === 'TIANLANG') {
        arr.push({
          key: '引导',
          label: '引导',
          onClick: () =>
            handleClick1(rightMenuType.parentId, rightMenuType.targetId),
        })
      }
      return [
        ...arr,
        {
          key: '标牌',
          label: '显示标牌',
          onClick: () => {
            setBoardOpenMap((s) => ({ ...s, [rightMenuType.targetId]: true }))
            setRightMenuType(null)
          },
          // handleClick1(rightMenuType.parentId, rightMenuType.targetId),
        },
      ]
    }
  }, [rightMenuType])

  const listenRightClick = (evt) => {
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
          (e.id.includes('device--') || e.id.includes('radartarget--')),
      )
      .slice(0, 8) // 限制 8 个
      .map((e) => {
        return runkind(e)
      })
      .filter((item) => !!item)

    if (res?.[0]?.kind === 'radartarget') {
      setRightMenuType(res[0])
    } else {
      setRightMenuType(null)
    }
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
  }

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
                e.id.includes('radartarget--') ||
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

    handler.setInputAction(
      listenRightClick,
      Cesium.ScreenSpaceEventType.RIGHT_CLICK,
    )

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
        updateRightMode(RightModeEnum.POINT_DETAIL)
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
        open={!!rightMenuType || open}
        trigger={['click']}
        menu={{
          items: RightMenus ?? items,
        }}
      >
        <div
          style={{
            position: 'fixed',
            width: '1px',
            height: '1px',
            left: '-1000px',
            top: '-1000px',
            display: rightMenuType || open ? 'block' : 'none',
          }}
          ref={divRef}
        />
      </Dropdown>
    </>
  )
})

CesiumGlobalPickEvent.displayName = 'CesiumGlobalClickEvent'

export default CesiumGlobalPickEvent
