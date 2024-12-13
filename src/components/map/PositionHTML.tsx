import { wgs84ToDrawingBufferCoordinates } from '@/utils/cesium/sence-transform'
import { useThrottleFn } from 'ahooks'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'

type PropsType = {
  position: number[]
  children?: ReactNode
  className?: string
}

const PositionHTML: FC<PropsType> = memo(
  ({ position, className, children }) => {
    const { viewer } = useCesium()
    const divRef = useRef<HTMLDivElement>(null)

    /** 更新屏幕坐标 */
    const { run: handleUpdatePostion } = useThrottleFn(
      () => {
        if (!viewer?.scene || !divRef.current) {
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

        const left = `${
          Math.floor(
            screenPostion.x / viewer.resolutionScale -
              divRef.current.clientWidth / 2,
          ) + rect.left
        }px`
        const top = `${
          Math.floor(
            screenPostion.y / viewer.resolutionScale -
              divRef.current.clientHeight / 2,
          ) + rect.top
        }px`
        if (
          divRef.current?.style.left === left &&
          divRef.current?.style.top === top
        ) {
          return
        }

        divRef.current!.style.left = left
        divRef.current!.style.top = top
      },
      { wait: 5, trailing: true },
    )

    useEffect(() => {
      if (!viewer?.scene) {
        return
      }
      handleUpdatePostion()
      const fn = () => handleUpdatePostion()
      viewer.scene?.preRender.addEventListener(fn)
      return () => {
        viewer.scene?.preRender.removeEventListener(fn)
      }
    }, [viewer])

    return (
      <div
        className={clsx('fixed left-[-9999px] top-[-9999px]', className)}
        ref={divRef}
      >
        {children}
      </div>
    )
  },
)

PositionHTML.displayName = 'PositionHTML'

export default PositionHTML
