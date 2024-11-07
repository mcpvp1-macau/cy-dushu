import { Dropdown, GetProps } from 'antd'
import { forwardRef, useImperativeHandle } from 'react'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'

type PropsType = Omit<GetProps<typeof Dropdown>, 'trigger' | 'open'> & {
  position: [number, number]
}

/** 坐标 menu */
const PositionMenu = memo(
  forwardRef<
    {
      open: () => void
      close: () => void
    },
    PropsType
  >(({ position, ...otherProps }, ref) => {
    const { viewer } = useCesium()
    const divRef = useRef<HTMLDivElement>(null)

    const [open, setOpen] = useState(false)

    const fn = useMemoizedFn(() => {
      if (!viewer?.scene) {
        return
      }
      const catesian = Cesium.Cartesian3.fromDegrees(position[0], position[1])
      const screenPostion =
        Cesium.SceneTransforms.worldToDrawingBufferCoordinates(
          viewer.scene,
          catesian,
        )
      if (!screenPostion) {
        return
      }

      const { x, y } = viewer.scene.canvas.getBoundingClientRect()

      if (divRef.current !== null) {
        divRef.current.style.left = `${
          x + 5 + screenPostion.x / viewer.resolutionScale
        }px`
        divRef.current.style.top = `${
          y + 5 + screenPostion.y / viewer.resolutionScale
        }px`
      }

      setTimeout(() => {
        setOpen(true)
        divRef.current?.click()
      })
    })

    /** 关闭和清空选项 */
    const clear = useMemoizedFn(() => {
      if (open === true) {
        setOpen(false)
      }
    })

    useEffect(() => {
      if (!viewer?.scene) {
        return
      }
      const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
      handler.setInputAction(clear, Cesium.ScreenSpaceEventType.LEFT_DOWN)
      handler.setInputAction(clear, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
      handler.setInputAction(clear, Cesium.ScreenSpaceEventType.WHEEL)

      return () => {
        handler.destroy()
      }
    }, [])

    useImperativeHandle(ref, () => ({
      open: () => fn(),
      close: () => clear(),
    }))

    return (
      <Dropdown open={open} {...otherProps} trigger={['click']}>
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
  }),
)

PositionMenu.displayName = 'PositionMenu'

export default PositionMenu
