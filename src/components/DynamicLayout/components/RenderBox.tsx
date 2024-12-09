import { memo, ReactNode, type FC } from 'react'
import useDynamicLayoutStore from '../store/useDynamicLayout.store'
import { DynamicLayoutType } from '..'
import { cloneDeep, get, set } from 'lodash'
import DynamicLayoutFullTabs from './DynamicLayoutFullTabs'

type PropsType = {
  componentMap: Record<string, ReactNode>
  layout: DynamicLayoutType
  fullTabsPath?: string
  onLayoutChange: (layout: DynamicLayoutType) => void
}

const RenderBox: FC<PropsType> = memo(
  ({ componentMap, layout, fullTabsPath, onLayoutChange }) => {
    const bounds = useDynamicLayoutStore((s) => s.bounds)

    const { activeKeys, notKeeyRenders } = useMemo(() => {
      /** 激活的 keys */
      const activeKeys = new Set<string>()
      /** 不需要保持 render 的面板 */
      const notKeeyRenders = new Set<string>()

      const dfs = (layout: DynamicLayoutType) => {
        if (layout.type === 'tabs') {
          activeKeys.add(layout.activeKey ?? layout.children[0].key)
          for (const e of layout.children) {
            if (e.keeyRenderOnHidden === false) {
              notKeeyRenders.add(e.key)
            }
          }
          return
        } else {
          for (const e of layout.children) {
            dfs(e)
          }
        }
      }
      dfs(layout)
      return { activeKeys, notKeeyRenders }
    }, [layout])

    const fullKeys = useMemo(() => {
      if (!fullTabsPath) {
        return new Set<string>()
      }
      const keys = new Set<string>()
      const res = get(layout, fullTabsPath)
      if (!Array.isArray(res?.children)) {
        console.error('fullTabsPath error', fullTabsPath)
        return keys
      }
      for (const e of res.children) {
        keys.add(e.key)
      }
      return keys
    }, [fullTabsPath, layout])

    console.log('notKeeyRenders', notKeeyRenders)

    return (
      <div
        className={clsx('absolute inset-2 pointer-events-none', {
          'backdrop-blur-0': fullTabsPath,
        })}
      >
        {fullTabsPath && (
          <div className="absolute inset-0 bg-ground-180 rounded overflow-hidden pointer-events-auto">
            <DynamicLayoutFullTabs
              layout={get(layout, fullTabsPath)}
              onLayoutChange={(l) => {
                const cloned = cloneDeep(layout)
                set(cloned, fullTabsPath, l)
                onLayoutChange(cloned)
              }}
            />
          </div>
        )}

        {Object.entries(componentMap).map(([key, component]) => {
          const b = bounds[key]
          if (!b) {
            return null
          }
          const isHidden = !activeKeys.has(key)
          // 不需要保持渲染
          if (isHidden && notKeeyRenders.has(key)) {
            return null
          }

          const isFullTab = fullKeys.size > 0 && fullKeys.has(key)

          const style: React.CSSProperties = isFullTab
            ? {
                top: 32,
                left: 0,
                width: '100%',
                height: 'calc(100% - 32px)',
              } // backdrop 可以改变 fixed 的范围
            : {
                top: b[0],
                left: b[3],
                width: b[1] - b[3],
                height: b[2] - b[0],
              }

          return (
            <div
              key={key}
              className={clsx('fixed overflow-hidden pointer-events-auto', {
                hidden:
                  !activeKeys.has(key) ||
                  (fullKeys.size > 0 && !fullKeys.has(key)),
              })}
              style={style}
            >
              {component}
            </div>
          )
        })}
      </div>
    )
  },
)

RenderBox.displayName = 'RenderBox'

export default RenderBox
