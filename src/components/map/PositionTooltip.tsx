import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import { limitNum } from '@/utils/math'
import { useThrottleFn } from 'ahooks'
import tippy, { type Instance } from 'tippy.js'
import { wgs84ToDrawingBufferCoordinates } from '@/utils/cesium/sence-transform'
import { attempt } from 'lodash'

type PropsType = {
  /** [lng, lat, height?] */
  position: number[]
  /** 永远保持在视口内 */
  alwayInViewport?: boolean
  children?: ReactNode
  offset?: [number, number]
  /**标牌是否能触发鼠标事件。默认值false，允许事件 */
  preventEvents?: boolean
}

/** 点位展示 */
const PositionTooltip: FC<PropsType> = memo(
  ({ position, alwayInViewport, offset, children, preventEvents = false }) => {
    const { viewer } = useCesium()

    const divRef = useRef<HTMLDivElement>(null)
    const contentRef = useRef<HTMLDivElement>(null)
    const tippyRef = useRef<Instance | null>(null)

    /** 更新屏幕坐标 */
    const { run: handleUpdatePostion } = useThrottleFn(
      () => {
        if (!viewer?.scene) {
          return
        }

        const catesian = Cesium.Cartesian3.fromDegrees(
          position[0],
          position[1],
          position[2] ?? 0,
        )
        const screenPostion = wgs84ToDrawingBufferCoordinates(
          viewer.scene,
          catesian,
        )
        if (!screenPostion) {
          return
        }

        const rect = viewer.scene.canvas.getBoundingClientRect()

        screenPostion.x = Math.floor(screenPostion.x / viewer.resolutionScale)
        screenPostion.y = Math.floor(screenPostion.y / viewer.resolutionScale)

        // 不需要一直在视口内
        if (!alwayInViewport) {
          if (
            screenPostion.x < 0 ||
            screenPostion.y < 0 ||
            screenPostion.x > rect.width ||
            screenPostion.y > rect.height
          ) {
            tippyRef.current?.hide()
            return
          } else {
            tippyRef.current?.show()
          }
        }
        const left = `${
          limitNum(Math.floor(screenPostion.x), 0, rect.width) + rect.left
        }px`
        const top = `${
          limitNum(Math.floor(screenPostion.y), 0, rect.height) + rect.top
        }px`
        if (
          divRef.current?.style.left === left &&
          divRef.current?.style.top === top
        ) {
          return
        }

        divRef.current!.style.left = left
        divRef.current!.style.top = top

        if (screenPostion.y < (contentRef.current?.clientHeight ?? 0)) {
          tippyRef.current?.setProps({
            placement: 'bottom',
          })
        } else {
          tippyRef.current?.setProps({
            placement: 'top',
          })
        }

        tippyRef.current?.popperInstance?.update()
      },
      { wait: 12, trailing: true },
    )

    // 创建 tippy 实例
    useEffect(() => {
      if (!divRef.current || !contentRef.current) {
        return
      }

      tippyRef.current = tippy(divRef.current, {
        content: contentRef.current,
        showOnCreate: true,
        trigger: 'manual',
        theme: 'liqun',
        animation: 'scale-subtle',
        arrow: true,
        offset,
        placement: 'top',
        interactive: true,
        hideOnClick: false,
        zIndex: 10,
        popperOptions: {
          strategy: 'fixed',
          modifiers: [
            {
              name: 'preventOverflow',
              options: {
                boundary: viewer?.scene.canvas,
                rootBoundary: viewer?.scene.canvas,
              },
            },
            {
              name: 'flip', // 启用自动翻转功能
              options: {
                fallbackPlacements: ['top', 'right', 'bottom', 'left'], // 当超出边界时，尝试其他方向
              },
            },
          ],
        },
      })
      return () => {
        tippyRef.current?.destroy()
      }
    }, [divRef])

    useEffect(() => {
      handleUpdatePostion()
    }, [position])

    useEffect(() => {
      if (!viewer?.scene) {
        return
      }
      handleUpdatePostion()
      const fn = () => handleUpdatePostion()
      viewer.scene?.preRender.addEventListener(fn)
      return () => {
        attempt(() => {
          viewer.scene?.preRender.removeEventListener(fn)
        })
      }
    }, [])

    return (
      <div style={{ pointerEvents: preventEvents ? 'none' : 'auto' }}>
        <div
          className="fixed h-0 z-[10] left-[-9999px] top-[-9999px]"
          ref={divRef}
        />
        <div ref={contentRef}>{children}</div>
      </div>
    )
  },
)

PositionTooltip.displayName = 'UavPointFlyConfirm'

export default PositionTooltip
