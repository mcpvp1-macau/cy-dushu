import { memo, type FC } from 'react'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import { Dropdown, MenuProps } from 'antd'
import DeviceIcon from '@/components/device/DeviceIcon'
import useRightMode from '@/store/layout/useRightMode.store'
import { RightModeEnum } from '@/enum/right-mode'

type PropsType = unknown

type SelectOptionType = {
  kind: string
  type: string
  name: string
  id: string
  lng: number
  lat: number
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
  const handleSelect = useMemoizedFn((e: SelectOptionType) => {
    switch (e.kind) {
      case 'device':
        updateRightMode(RightModeEnum.DEVICE)
        updateDetailId(e.id)
        break
    }
    clearOptions()
  })

  const items = useMemo<MenuProps['items']>(
    () =>
      selectOptions.map((e) => ({
        key: e.id,
        label: (
          <p className="flex gap-2">
            {e.kind === 'device' && <DeviceIcon type={e.type} />}
            {e.name}
          </p>
        ),
        onClick: () => handleSelect(e),
      })),
    [selectOptions],
  )

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
              e.primitive instanceof Cesium.Billboard &&
              e.id &&
              typeof e.id === 'string' &&
              e.id.includes('device--'),
          )
          .slice(0, 8) // 限制 8 个
          .map((e) => {
            const [kind, type, name, id, lng, lat] = e.primitive.id.split('--')
            return {
              kind,
              type,
              name,
              id,
              lng: parseFloat(lng),
              lat: parseFloat(lat),
            }
          })

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
    handler.setInputAction(
      clearOptions,
      Cesium.ScreenSpaceEventType.RIGHT_CLICK,
    )
    handler.setInputAction(clearOptions, Cesium.ScreenSpaceEventType.WHEEL)

    return () => {
      handler.destroy()
    }
  }, [viewer])

  return (
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
  )
})

CesiumGlobalPickEvent.displayName = 'CesiumGlobalClickEvent'

export default CesiumGlobalPickEvent
