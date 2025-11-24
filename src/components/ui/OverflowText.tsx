import { useLayoutEffect } from 'react'
import LiqunTippy from './LiqunTippy'

type PropsType = {
  children: ReactNode
  className?: string
}

const OverflowText: FC<PropsType> = memo(({ children, className }) => {
  const ref = useRef<HTMLDivElement>(null)

  const [isOverflow, setIsOverflow] = useState(false)

  useLayoutEffect(() => {
    const el = ref.current
    if (el) {
      setIsOverflow(el.scrollWidth > el.clientWidth)
    }
  }, [children])

  if (isOverflow) {
    return (
      <LiqunTippy content={<div>{children}</div>}>
        <div ref={ref} className={className}>
          {children}
        </div>
      </LiqunTippy>
    )
  }

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
})

OverflowText.displayName = 'OverflowText'

export default OverflowText
