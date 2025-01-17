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
  const { t, i18n } = useTranslation()
  const containerRef = useRef<HTMLDivElement | null>(null)

  const size = useSize(containerRef)
  const w = size?.width ?? 0
  const h = size?.height ?? 0
  const isVertical = w <= MIN_SIZE && w > 0

  const handleCollapseToggle = useMemoizedFn(() => {
    onLayoutChange?.({
      ...layout,
      isCollapsed: !layout.isCollapsed,
      size: layout.isCollapsed ? 350 : 0,
    })
  })

  const iconMap = useDynamicLayoutStore((s) => s.iconMap)
  const titleMap = useDynamicLayoutStore((s) => s.titleMap)

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
    <div className={clsx('size-full flex flex-col group')}>
      <div
        className={clsx('flex justify-between items-center bg-ground-3 gap-2', {
          'flex-col h-full': isVertical,
        })}
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
                      'bg-ground-5',
                      isVertical ? 'h-[1px] w-3' : 'h-3 w-[1px]',
                    )}
                  />
                )}
                {/* Tab 标签 */}
                <li
                  className={clsx(
                    'cursor-pointer font-medium hover:bg-ground-5 rounded flex flex-shrink-0 gap-1 items-center text-white',
                    isVertical ? 'px-0.5 py-1.5' : 'px-1.5 py-0.5',
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
                  <div
                    className={clsx(
                      'whitespace-nowrap flex gap-1 items-center',
                      {
                        'flex-col': isVertical,
                      },
                    )}
                  >
                    <div
                      className={clsx({
                        'rotate-90': isVertical,
                        'opacity-60': activeKey !== e.key,
                      })}
                    >
                      {iconMap?.[e.key]}
                    </div>
                    <div
                      style={{
                        writingMode: isVertical ? 'vertical-rl' : undefined,
                        letterSpacing:
                          isVertical && i18n.language === 'zh'
                            ? '0.2em'
                            : undefined,
                      }}
                    >
                      {titleMap[e.key] ?? '?'}
                    </div>
                  </div>
                </li>
              </Fragment>
            ))}
          </ul>
          {!isVertical && <ScrollBar orientation="horizontal"></ScrollBar>}
        </ScrollArea>
        {/* 右侧的按钮们 */}
        <div
          className={clsx(
            'text-sm hidden group-hover:flex gap-2 animate-in fade-in duration-500 items-center text-ground-5',
            isVertical ? 'pb-2' : 'pr-2',
            {
              'flex-col w-full': isVertical,
            },
          )}
        >
          <IconButton
            className="text-sm"
            toolTipProps={{
              title: layout.isFull
                ? t('dynamicLayout.exit.title')
                : t('dynamicLayout.maximize.title'),
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
              title: layout.isCollapsed
                ? t('dynamicLayout.unfold.title')
                : t('dynamicLayout.fold.title'),
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
        className={clsx('flex-1 w-full relative bg-ground-2')}
      />
    </div>
  )
})

DynamicLayoutTabs.displayName = 'DynamicLayoutTabs'

export default DynamicLayoutTabs
