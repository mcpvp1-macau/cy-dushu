import { useSize, useThrottleFn } from 'ahooks'
import { DynamicLayout, DynamicLayoutType } from '..'
import SplitBar from './SplitBar'
import { Fragment } from 'react'

type PropsType = {
  layout: DynamicLayoutType & {
    type: 'row' | 'col'
  }
  onLayoutChange: (layout: DynamicLayoutType) => void
}

export const MIN_SIZE = 32

const DynamicLayoutSplitter: FC<PropsType> = memo(
  ({ layout, onLayoutChange }) => {
    const containerRef = useRef<HTMLDivElement | null>(null)
    const size = useSize(containerRef)

    // const [sizes, setSizes] = useState<number[]>([])
    const sz = layout.type === 'row' ? size?.width : size?.height
    const [startPos, setStartPos] = useState(0)
    const [operateIndex, setOperateIndex] = useState(-1)

    const [sizes, setSizes] = useState(() => layout.children.map((e) => e.size))
    const startSizes = useRef(sizes)

    // 当容器大小变化时，重新计算子元素的大小
    useEffect(() => {
      if (!sz) {
        return
      }

      const gapSize = (layout.children.length - 1) * 8
      const totalSize = sz - gapSize

      // 决定是否使用默认大小
      const useSizes = layout.children.map((e) => e.size)
      const totalWeight = useSizes.reduce((acc, e) => acc + e, 0)
      let totWeight2 = 0
      const newSizes = new Array(layout.children.length).fill(0)

      let minCnt = 0
      // 先处理小于最小值的情况
      for (let i = 0; i < useSizes.length; i++) {
        if (
          // 折叠
          layout.children[i].isCollapsed ||
          // 小于最小值
          (useSizes[i] / totalWeight) * totalSize < MIN_SIZE
        ) {
          newSizes[i] = MIN_SIZE
          minCnt++
        } else {
          totWeight2 += useSizes[i]
        }
      }
      // 处理剩下的空间
      const restSize = totalSize - minCnt * MIN_SIZE
      for (let i = 0; i < newSizes.length; i++) {
        if (newSizes[i] === 0) {
          newSizes[i] = (useSizes[i] / totWeight2) * restSize
        }
      }

      setSizes(newSizes)
    }, [sz, layout.children])

    // 处理拖拽事件
    const { run: handleResize } = useThrottleFn(
      (x: number, y: number) => {
        if (operateIndex === -1 || !sz) {
          return
        }
        const d = (layout.type === 'row' ? x : y) - startPos
        const newSizes = [...startSizes.current]
        newSizes[operateIndex] -= d
        newSizes[operateIndex - 1] += d

        // 如果说拖拽后的大小小于最小值，则进行调整
        if (newSizes[operateIndex] < MIN_SIZE) {
          newSizes[operateIndex - 1] += newSizes[operateIndex] - MIN_SIZE
          newSizes[operateIndex] = MIN_SIZE
        } else if (newSizes[operateIndex - 1] < MIN_SIZE) {
          newSizes[operateIndex] += newSizes[operateIndex - 1] - MIN_SIZE
          newSizes[operateIndex - 1] = MIN_SIZE
        }
        setSizes(newSizes)
      },
      { wait: 5, trailing: true },
    )

    const handleSpliterBarStartResize = useMemoizedFn(
      (x: number, y: number, i: number) => {
        if (layout.type === 'row') {
          setStartPos(x)
        } else {
          setStartPos(y)
        }
        setOperateIndex(i)
        startSizes.current = sizes
      },
    )

    const handleSizeEnd = useMemoizedFn(() => {
      onLayoutChange({
        ...layout,
        children: layout.children.map((e, i) => ({
          ...e,
          size: sizes[i],
          isCollapsed: sizes[i] <= MIN_SIZE,
        })),
      })
    })

    return (
      <div
        ref={containerRef}
        className={clsx('size-full flex', {
          'flex-col': layout.type === 'col',
        })}
      >
        {layout.children.map((e, i) => (
          <Fragment key={i}>
            {i > 0 && (
              <SplitBar
                vertical={layout.type === 'col'}
                index={i}
                key={`s-${i}`}
                onStartResize={handleSpliterBarStartResize}
                onResize={handleResize}
                onSizeEnd={handleSizeEnd}
              />
            )}
            <div
              key={i}
              className="relative overflow-hidden flex-1"
              style={{
                flexBasis: `${sizes[i] || 0}px`,
                flexGrow: `${layout.children[i].isCollapsed ? 0 : 1}`,
              }}
            >
              <DynamicLayout
                layout={e}
                onLayoutChange={(would) => {
                  onLayoutChange({
                    ...layout,
                    children: layout.children.map((e2, i2) => {
                      if (i2 === i) {
                        return would
                      }
                      return e2
                    }),
                  })
                }}
              />
            </div>
          </Fragment>
        ))}
      </div>
    )
  },
)

DynamicLayoutSplitter.displayName = 'DynamicLayoutRow'

export default DynamicLayoutSplitter
