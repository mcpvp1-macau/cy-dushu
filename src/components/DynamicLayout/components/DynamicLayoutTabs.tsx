import { useSize } from 'ahooks'
import { MIN_SIZE } from './DynamicLayoutSplitter'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

export type DynamicLayoutTabsType = {
  key: string
  icon?: ReactNode
  title: ReactNode
  children: ReactNode
}[]

type PropsType = {
  /** 选项卡内容 */
  tabs: DynamicLayoutTabsType
}

const DynamicLayoutTabs: FC<PropsType> = memo(({ tabs }) => {
  const [active, setActive] = useState(tabs[0].key)

  const containerRef = useRef<HTMLDivElement | null>(null)

  const size = useSize(containerRef)
  const w = size?.width ?? 0
  const h = size?.height ?? 0
  const isHidden = w <= 64 || h <= 64
  const isVertical = w <= MIN_SIZE

  console.log(isHidden)

  return (
    <div
      ref={containerRef}
      className="size-full flex flex-col rounded relative overflow-hidden"
    >
      <ScrollArea className="flex-shrink-0">
        <ul
          className={clsx('flex text-sm p-1 select-none bg-ground-200 gap-1', {
            'flex-col h-full': isVertical,
          })}
        >
          {tabs.map((e) => (
            <li
              className={clsx(
                'px-1.5 py-0.5 cursor-pointer font-medium hover:bg-ground-250 rounded flex flex-shrink-0 gap-1 items-center text-white',
                {
                  'flex-col': isVertical,
                  'text-opacity-70': e.key !== active,
                },
              )}
              key={e.key}
              onClick={() => setActive(e.key)}
            >
              <i
                className={clsx({
                  'rotate-90': isVertical,
                  'opacity-60': e.key !== active,
                })}
              >
                {e.icon}
              </i>
              <span>{e.title}</span>
            </li>
          ))}
        </ul>
        {!isVertical && <ScrollBar orientation="horizontal"></ScrollBar>}
      </ScrollArea>

      <div
        className={clsx(
          'flex-1 w-full relative bg-ground-180 overflow-hidden',
          {
            hidden: isHidden,
          },
        )}
      >
        {tabs.find((e) => e.key === active)?.children}
      </div>
    </div>
  )
})

DynamicLayoutTabs.displayName = 'DynamicLayoutTabs'

export default DynamicLayoutTabs
