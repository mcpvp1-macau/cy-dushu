import { limitNum } from '@/utils/math'
import { sortSearchFnAsc } from '@/utils/sort'
import { Fragment, useLayoutEffect } from 'react'

type PropsType = {
  items?: {
    /** 标签 */
    label: string
    /** 值 */
    value: number
    /** (lastValue, value) 所占据的比重, 0 值请不要使用~ */
    span: number
    /** (lastValue, value) 横线数目, 0 值请不要使用~ */
    lineCnt: number
  }[]
  value: number
  onChange?: (value: number) => unknown
  onWheel?: (e: React.WheelEvent<HTMLDivElement>) => unknown
}

const c = (label: string, value: number, span: number, lineCnt: number) => ({
  label,
  value,
  span,
  lineCnt,
})

const initialItems = [
  c('2x', 2, 0, 0),
  c('5x', 5, 2, 3),
  c('10x', 10, 3, 5),
  c('20x', 20, 4, 6),
  c('200x', 200, 7, 16),
]

/** 变焦滑动组件 */
const ZoomSlider: FC<PropsType> = memo(
  ({ items = initialItems, value, onChange, onWheel }) => {
    let tot = 0
    const renderItems = items
      .toSorted((a, b) => a.value - b.value)
      .map((item, i) => {
        tot += item.lineCnt
        return {
          ...item,
          offset: tot,
          span: i === 0 ? 0 : item.span,
          lineCnt: i === 0 ? 0 : item.lineCnt,
        }
      })
    const [positionInfo, setPositionInfo] = useState({
      rootHeight: 0,
      bottomPercents: [] as number[],
    })
    const startMove = useRef(false)

    const changeValue = (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect()
      const diffMouse = e.clientY - rect.y
      const percent = 1 - diffMouse / rect.height
      let value = 0
      const i =
        sortSearchFnAsc(positionInfo.bottomPercents, (x) => x > percent) - 1
      if (i === positionInfo.bottomPercents.length - 1) {
        value = items.at(-1)!.value
      } else if (i >= 0) {
        const prev = positionInfo.bottomPercents[i]
        const curr = positionInfo.bottomPercents[i + 1]
        const diff = curr - prev
        const diffValue = renderItems[i + 1].value - renderItems[i].value
        value = renderItems[i].value + diffValue * ((percent - prev) / diff)
      }
      value = limitNum(value, items[0].value, items[items.length - 1].value)
      onChange?.(value)
    }

    // 滑动事件
    const handleMouseDown = useMemoizedFn(
      (e: React.MouseEvent<HTMLDivElement>) => {
        startMove.current = true
        e.preventDefault()
        e.stopPropagation()
        changeValue(e)
      },
    )

    const handleMove = useMemoizedFn((e: React.MouseEvent<HTMLDivElement>) => {
      if (!startMove.current) {
        return
      }
      e.preventDefault()
      e.stopPropagation()
      changeValue(e)
    })

    const handleSbClick = useMemoizedFn((v: number) => {
      onChange?.(v)
    })

    const handleLeaveOrUp = useMemoizedFn(() => {
      startMove.current = false
    })

    const rootRef = useRef<HTMLDivElement>(null)

    useLayoutEffect(() => {
      if (!rootRef.current) {
        return
      }
      const root = rootRef.current
      const rootClient = root.getBoundingClientRect()
      positionInfo.rootHeight = rootClient.height

      const sbs = root.querySelectorAll('.sb')
      setPositionInfo({
        rootHeight: rootClient.height,
        bottomPercents: Array.from(sbs)
          .map((sb) => {
            const rect = sb.getBoundingClientRect()
            const delta = rect.y - rootClient.y + rect.height / 2
            return 1 - delta / rootClient.height
          })
          .toSorted(),
      })
    }, [items])

    // 计算当前值对应的位置
    const index = sortSearchFnAsc(items, (x) => x.value > value) - 1
    let bottom = 0
    if (index === items.length - 1) {
      bottom = positionInfo.bottomPercents.at(-1)!
    } else if (index >= 0) {
      const prev = positionInfo.bottomPercents[index]
      const curr = positionInfo.bottomPercents[index + 1]
      const diffPercent = curr - prev
      const diffValue = renderItems[index + 1].value - renderItems[index].value
      const diff = (value - renderItems[index].value) / diffValue
      bottom = prev + diffPercent * diff
    }

    const handleWheel = useMemoizedFn((e: React.WheelEvent<HTMLDivElement>) => {
      onWheel?.(e)
    })

    return (
      <div className="absolute right-0 top-2 bottom-2 left-0 text-sm">
        <div
          ref={rootRef}
          className="flex flex-col-reverse h-full items-end"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMove}
          onMouseLeave={handleLeaveOrUp}
          onMouseUp={handleLeaveOrUp}
          onWheel={handleWheel}
        >
          {renderItems.map((item) => (
            <Fragment key={item.value}>
              {/* 滑动区域 */}
              <div
                className="flex flex-col justify-between"
                style={{ flexGrow: item.span }}
              >
                {Array.from({ length: item.lineCnt }).map((_, i) => (
                  <div key={i} className="mr-2 w-1 h-[1px] bg-neutral-200" />
                ))}
              </div>
              {/* 标牌 */}
              <div
                className="sb group/sb mr-2 flex items-center gap-1 select-none leading-3 cursor-pointer hover:text-primary"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => handleSbClick(item.value)}
              >
                {item.label}
                <div
                  className="w-2 h-2 rounded-full bg-neutral-200 group-hover/sb:bg-primary"
                  style={{ transform: 'translateX(25%)' }}
                />
              </div>
            </Fragment>
          ))}
          <div
            className="absolute right-1 w-3 h-3 bg-primary rounded-full border-2 border-neutral-100 border-solid z-20"
            style={{
              transform: 'translateY(50%)',
              bottom: `${bottom * 100}%`,
            }}
          >
            <div className="absolute left-0 -translate-x-[110%] top-1/2 -translate-y-1/2 select-none">
              <p
                className="px-2 py-1"
                style={{
                  background:
                    'linear-gradient(to top,#0000 0%,#1b222b 30%,#1b222b,#1b222b 70%,#0000 100%)',
                }}
              >
                {Math.floor(value)}x
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  },
)

ZoomSlider.displayName = 'Zoom'

export default ZoomSlider
