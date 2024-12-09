import { useSize } from 'ahooks'
import { MIN_SIZE } from './DynamicLayoutSplitter'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Fragment } from 'react/jsx-runtime'
import IconButton from '@/components/ui/button/IconButton'
import IconLeft from '@/assets/icons/jsx/IconLeft'
import { IconFullscreen2 } from '@/assets/icons/jsx/IconFullscreen2'
import { DynamicLayoutType } from '..'
import IconRight from '@/assets/icons/jsx/IconRight'
import useDynamicLayoutStore from '../store/useDynamicLayout.store'

export type DynamicLayoutTabsType = {
  key: string
  title: ReactNode
  keeyRenderOnHidden?: boolean
}[]

type PropsType = {
  /** 选项卡内容 */
  layout: DynamicLayoutType & {
    type: 'tabs'
  }
  onLayoutChange: (layout: DynamicLayoutType) => void
}

/** Tab 动态布局 */
const DynamicLayoutTabs: FC<PropsType> = memo(({ layout, onLayoutChange }) => {
  const containerRef = useRef<HTMLDivElement | null>(null)

  const size = useSize(containerRef)
  const w = size?.width ?? 0
  const h = size?.height ?? 0
  const isVertical = w <= MIN_SIZE

  const handleCollapseToggle = useMemoizedFn(() => {
    onLayoutChange?.({
      ...layout,
      isCollapsed: !layout.isCollapsed,
      size: layout.isCollapsed ? 350 : 0,
    })
  })

  const iconMap = useDynamicLayoutStore((s) => s.iconMap)

  // 更新该渲染组件的边界
  const updateMergeBounds = useDynamicLayoutStore((s) => s.updateMergeBounds)
  useEffect(() => {
    const bounds: Record<string, [number, number, number, number]> = {}
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) {
      return
    }
    const r: [number, number, number, number] = [
      rect.top,
      rect.right,
      rect.bottom,
      rect.left,
    ]
    layout.children.forEach((e) => {
      bounds[e.key] = r
    })
    updateMergeBounds(bounds)
  }, [w, h])

  const activeKey = layout.activeKey ?? layout.children[0]?.key

  return (
    <div className="size-full flex flex-col group">
      <div
        className={clsx(
          'flex justify-between items-center bg-ground-200 gap-2',
          {
            'flex-col h-full': isVertical,
          },
        )}
        onDoubleClick={handleCollapseToggle}
      >
        <ScrollArea className="flex-1 flex-shrink-0">
          <ul
            className={clsx(
              'flex gap-0.5 items-center text-sm p-1 select-none',
              {
                'flex-col h-full': isVertical,
              },
            )}
          >
            {layout.children.map((e, i) => (
              <Fragment key={e.key}>
                {/* 分割线 */}
                {i > 0 && (
                  <li
                    className={clsx(
                      ' bg-ground-300',
                      isVertical ? 'h-[1px] w-3' : 'h-3 w-[1px]',
                    )}
                  />
                )}
                {/* Tab 标签 */}
                <li
                  className={clsx(
                    'px-1.5 py-0.5 cursor-pointer font-medium hover:bg-ground-250 rounded flex flex-shrink-0 gap-1 items-center text-white',
                    {
                      'flex-col': isVertical,
                      'text-opacity-70': e.key !== activeKey,
                    },
                  )}
                  onClick={() => {
                    onLayoutChange?.({
                      ...layout,
                      activeKey: e.key,
                      isCollapsed: false,
                      size: layout.isCollapsed ? 350 : layout.size,
                    })
                  }}
                >
                  <i
                    className={clsx({
                      'rotate-90': isVertical,
                      'opacity-60': e.key !== activeKey,
                    })}
                  >
                    {iconMap?.[e.key]}
                  </i>
                  <span>{e.title}</span>
                </li>
              </Fragment>
            ))}
          </ul>
          {!isVertical && <ScrollBar orientation="horizontal"></ScrollBar>}
        </ScrollArea>
        {/* 右侧的按钮们 */}
        <div
          className={clsx(
            'text-sm hidden group-hover:flex gap-2 animate-in fade-in duration-500 items-center text-ground-300',
            isVertical ? 'pb-2' : 'pr-2',
            {
              'flex-col w-full': isVertical,
            },
          )}
        >
          <IconButton
            className="text-sm"
            toolTipProps={{
              title: layout.isFull ? '缩小' : '最大化',
              mouseEnterDelay: 0.2,
            }}
            onClick={() =>
              onLayoutChange?.({ ...layout, isFull: !layout.isFull })
            }
          >
            <IconFullscreen2 className="scale-90" />
          </IconButton>
          <IconButton
            toolTipProps={{
              title: layout.isCollapsed ? '展开' : '折叠',
              mouseEnterDelay: 0.2,
            }}
            onClick={handleCollapseToggle}
          >
            {layout.isCollapsed ? (
              <IconLeft className="scale-[85%] translate-y-[0.5px]" />
            ) : (
              <IconRight className="scale-[85%] translate-y-[0.5px]" />
            )}
          </IconButton>
        </div>
      </div>

      <div
        ref={containerRef}
        className={clsx('flex-1 w-full relative bg-ground-180')}
      />
    </div>
  )
})

DynamicLayoutTabs.displayName = 'DynamicLayoutTabs'

export default DynamicLayoutTabs
