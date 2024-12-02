import { useSize } from 'ahooks'
import { DynamicLayout, DynamicLayoutType } from '..'
import SplitBar from './SplitBar'

type PropsType = {
  mode?: 'vertical' | 'horizontal'
  layout: DynamicLayoutType[]
  collapse?: boolean
}

export const MIN_SIZE = 32

const DynamicLayoutSplitter: FC<PropsType> = memo(
  ({ layout, mode = 'horizontal', collapse }) => {
    const containerRef = useRef<HTMLDivElement | null>(null)
    const size = useSize(containerRef)

    const [sizes, setSizes] = useState<number[]>([])
    const sz = mode === 'horizontal' ? size?.width : size?.height
    const [startPos, setStartPos] = useState(0)
    const [collapses, setCollapses] = useState<boolean[]>([])
    const [operateIndex, setOperateIndex] = useState(-1)

    // 当容器大小变化时，重新计算子元素的大小
    useEffect(() => {
      if (!sz) {
        return
      }

      const gapSize = (layout.length - 1) * 8
      const totalSize = sz - gapSize
      const useSizes = sizes.length ? sizes : layout.map((e) => e.size)
      const totalWeight = useSizes.reduce((acc, e) => acc + e, 0)

      const newSizes = useSizes.map((e) => (e / totalWeight) * totalSize)

      setCollapses(newSizes.map((e) => e <= MIN_SIZE))
      setSizes(newSizes)
    }, [sz])

    // 处理拖拽事件
    const handleResize = (x: number, y: number) => {
      if (operateIndex === -1 || !sz) {
        return
      }

      const d = (mode === 'horizontal' ? x : y) - startPos
      const newSizes = [...sizes]
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
      setCollapses(newSizes.map((e) => e <= MIN_SIZE))
      setStartPos(x)
    }

    return (
      <div
        ref={containerRef}
        className={clsx('size-full flex', {
          'flex-col': mode === 'vertical',
        })}
      >
        {layout.map((e, i) => (
          <>
            {i > 0 && (
              <SplitBar
                vertical={mode === 'vertical'}
                key={`s-${i}`}
                onStartResize={(x, y) => {
                  if (mode === 'horizontal') {
                    setStartPos(x)
                  } else {
                    setStartPos(y)
                  }
                  setOperateIndex(i)
                }}
                onResize={handleResize}
              />
            )}
            <div
              key={i}
              className="bg-ground-200 rounded relative overflow-hidden flex-1"
              style={{
                flexBasis: `${sizes[i] || 0}px`,
              }}
            >
              <DynamicLayout
                layout={e}
                collapse={collapses[i] || collapse}
                vertical={mode === 'vertical'}
              />
            </div>
          </>
        ))}
      </div>
    )
  },
)

DynamicLayoutSplitter.displayName = 'DynamicLayoutRow'

export default DynamicLayoutSplitter
