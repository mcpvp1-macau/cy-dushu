import { Html } from '@react-three/drei'
import { Vector3 } from 'three'
import tippy, { type Instance } from 'tippy.js'
import { ComponentRef } from 'react'
import { useThreeCanvasWrapper } from './ThreeCanvas'
import { v4 } from 'uuid'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/dist/border.css'
import 'tippy.js/animations/scale.css'
import 'tippy.js/animations/scale-subtle.css'

type PropsType = {
  position: Vector3
  offset?: [number, number]
  children?: React.ReactNode
}

const PositionTooltip: FC<PropsType> = memo((props) => {
  const contentRef = useRef<HTMLDivElement>(null)
  const tippyRef = useRef<Instance | null>(null)
  const id = useRef<string | null>(null)
  if (!id.current) {
    id.current = v4()
  }

  const htmlRef = useRef<ComponentRef<typeof Html>>(null)

  const wrapper = useThreeCanvasWrapper()

  const [exist, setExist] = useState(false)

  // 创建 tippy 实例
  useEffect(() => {
    if (!htmlRef.current || !contentRef.current) {
      return
    }

    tippyRef.current = tippy(htmlRef.current, {
      content: contentRef.current,
      showOnCreate: true,
      trigger: 'manual',
      theme: 'liqun',
      animation: 'scale-subtle',
      arrow: true,
      offset: props.offset,
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
              boundary: wrapper?.current,
              rootBoundary: wrapper?.current,
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
  }, [htmlRef, contentRef, exist])

  // 监听挂载成功
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (
          mutation.type === 'childList' &&
          mutation.target instanceof HTMLElement &&
          mutation.target.className.includes(id.current!)
        ) {
          setExist(true)
          observer.disconnect()
          break
        }
      }
    })
    if (wrapper?.current) {
      observer.observe(wrapper.current, { childList: true, subtree: true })
    }

    return () => observer.disconnect()
  }, [wrapper])

  return (
    <Html
      position={props.position}
      ref={htmlRef}
      wrapperClass={id.current!}
      prepend
      portal={wrapper}
    >
      <div ref={contentRef}>{props.children}</div>
    </Html>
  )
})

PositionTooltip.displayName = 'PositionTooltip'

export default PositionTooltip
