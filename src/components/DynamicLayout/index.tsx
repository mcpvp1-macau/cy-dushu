import { memo, ReactNode, useLayoutEffect, type FC } from 'react'
import DynamicLayoutSplitter from './components/DynamicLayoutSplitter'
import DynamicLayoutTabs, {
  DynamicLayoutTabsType,
} from './components/DynamicLayoutTabs'
import {
  createDynamicLayoutStore,
  DynamicLayoutStore,
  DynamicLayoutStoreContext,
} from './store/useDynamicLayout.store'
import RenderBox from './components/RenderBox'

export type DynamicLayoutType = {
  /** 占用大小 */
  size: number
  /** 是否收起 */
  isCollapsed?: boolean
  /** 是否全屏 */
  isFull?: boolean
} & (
  | {
      type: 'tabs'
      // tabs: DynamicLayoutTabsType
      activeKey?: string
      children: DynamicLayoutTabsType
    }
  | {
      type: 'row' | 'col'
      children: DynamicLayoutType[]
    }
)

/** 灵动布局 */
const DynamicLayout: FC<{
  layout: DynamicLayoutType
  onLayoutChange: (layout: DynamicLayoutType) => void
}> = memo(({ layout, onLayoutChange }) => {
  /** 处理改变 */
  const handleChane = useMemoizedFn((layout: DynamicLayoutType) => {
    if (layout.type === 'row' || layout.type === 'col') {
      let allCollapsed = true
      for (const e of layout.children) {
        if (!e.isCollapsed) {
          allCollapsed = false
          break
        }
      }
      if (allCollapsed) {
        layout.children[0].isCollapsed = false
        layout.children[0].size = 350
      }
    }
    onLayoutChange(layout)
  })

  return (
    <div className="size-full rounded overflow-hidden">
      {layout.type === 'tabs' ? (
        <DynamicLayoutTabs layout={layout} onLayoutChange={handleChane} />
      ) : (
        <DynamicLayoutSplitter layout={layout} onLayoutChange={handleChane} />
      )}
    </div>
  )
})

DynamicLayout.displayName = 'DynamicLayout'

export { DynamicLayout }

type PropsType = {
  layout: DynamicLayoutType
  onLayoutChange: (layout: DynamicLayoutType) => void
  componentMap?: Record<string, ReactNode>
  iconMap?: Record<string, ReactNode>
  titleMap?: Record<string, ReactNode>
}

/** 动态布局 */
const DynamicLayoutRoot: FC<PropsType> = memo(
  ({ layout, iconMap, componentMap, titleMap, onLayoutChange }) => {
    const store = useRef<DynamicLayoutStore | null>(null)

    if (!store.current) {
      store.current = createDynamicLayoutStore()
    }

    useLayoutEffect(() => {
      if (iconMap) {
        store.current?.getState().updateIconMap(iconMap || {})
      }
    }, [iconMap])

    useLayoutEffect(() => {
      if (titleMap) {
        store.current?.getState().updateTitleMap(titleMap || {})
      }
    }, [titleMap])

    // 计算全屏 Tabs 的路径
    const fullTabsPath = useMemo(() => {
      const dfs = (layout: DynamicLayoutType, path: string) => {
        let res = ''
        if (layout.type === 'tabs') {
          if (layout.isFull) {
            return path
          }
        } else {
          for (let i = 0; i < layout.children?.length; i++) {
            res =
              res ||
              dfs(layout.children[i], `${path}${path ? '.' : ''}children[${i}]`)
          }
        }
        return res
      }
      return dfs(layout, '')
    }, [layout])

    return (
      <DynamicLayoutStoreContext.Provider value={store.current}>
        <div className={clsx('relative size-full p-2')}>
          <DynamicLayout layout={layout} onLayoutChange={onLayoutChange} />
          {componentMap && (
            <RenderBox
              componentMap={componentMap}
              layout={layout}
              fullTabsPath={fullTabsPath}
              onLayoutChange={onLayoutChange}
            />
          )}
        </div>
      </DynamicLayoutStoreContext.Provider>
    )
  },
)

DynamicLayoutRoot.displayName = 'DynamicLayoutRoot'

export default DynamicLayoutRoot
