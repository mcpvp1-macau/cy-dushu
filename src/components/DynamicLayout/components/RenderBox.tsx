import { memo, ReactNode, type FC } from 'react'
import useDynamicLayoutStore from '../store/useDynamicLayout.store'
import { DynamicLayoutType } from '..'

type PropsType = {
  componentMap: Record<string, ReactNode>
  layout: DynamicLayoutType
}

const RenderBox: FC<PropsType> = memo(({ componentMap, layout }) => {
  const bounds = useDynamicLayoutStore((s) => s.bounds)

  const [activeKeys, notKeeyRenders, fullScreenTabs] = useMemo(() => {
    const keys = new Set<string>()
    const notKeeyRenders = new Set<string>()
    let fullScreenTabs: (DynamicLayoutType & { type: 'tabs' }) | null = null

    const dfs = (layout: DynamicLayoutType) => {
      if (layout.type === 'tabs') {
        if (layout.isFull) {
          fullScreenTabs = layout
        }
        keys.add(layout.activeKey ?? layout.children[0].key)
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
    return [keys, notKeeyRenders, fullScreenTabs]
  }, [layout])

  return (
    <>
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
        return (
          <div
            key={key}
            className={clsx('fixed overflow-hidden', {
              hidden: !activeKeys.has(key),
            })}
            style={{
              top: b[0],
              left: b[3],
              width: b[1] - b[3],
              height: b[2] - b[0],
            }}
          >
            {component}
          </div>
        )
      })}
    </>
  )
})

RenderBox.displayName = 'RenderBox'

export default RenderBox
