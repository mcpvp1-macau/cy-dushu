import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import { Dropdown, MenuProps } from 'antd'
import DeviceIcon from '@/components/device/DeviceIcon'
import useRightMode from '@/store/layout/useRightMode.store'
import { RightModeEnum } from '@/enum/right-mode'
import * as helper from './DeviceMarkers/GlobalPickEvent/helper'

const handlePickedObject = (e: any) => {
  if (e.id?.startsWith?.('deviceCluster(')) {
    return helper.parseDeviceCluster(e.id)
  }

  if (typeof e.id._id === 'string') {
    // entity 的情况会在 e.id._id 上
    if (e.id._id.startsWith('device--')) {
      return helper.parseDevice(e.id._id)
    } else {
      return null
    }
  } else if (typeof e.primitive?.id === 'string') {
    // 一般是 Primitive 的情况
    const [kind] = e.primitive.id.split('--', 1) || []
    if (kind === 'device') {
      return helper.parseDevice(e.primitive.id)
    } else if (kind === 'event') {
      return helper.parseEvent(e.primitive.id)
    }
  }
  return null
}

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
    }
  })

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
              // 普通情况
              ((e.primitive instanceof Cesium.Billboard ||
                e.primitive instanceof Cesium.PointPrimitive) &&
                e.id &&
                typeof e.id === 'string' &&
                (e.id.startsWith('device--') ||
                  e.id.startsWith('event--') ||
                  e.id.startsWith('deviceCluster('))) ||
              // entity 情况
              (typeof e.id?._id === 'string' &&
                e.id._id.startsWith('device--')),
          )
          .slice(0, 16) // 限制 16 个
          .map(handlePickedObject)
          .flat()
          .filter((item) => !!item) as SelectOptionType[]

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

CesiumGlobalPickEvent.displayName = 'CesiumGlobalClickEvent'

export default CesiumGlobalPickEvent
