import { memo, type FC } from 'react'
import DynamicLayoutSplitter from './components/DynamicLayoutSplitter'
import DynamicLayoutTabs, {
  DynamicLayoutTabsType,
} from './components/DynamicLayoutTabs'

export type DynamicLayoutType = {
  size: number
} & (
  | {
      tabs: DynamicLayoutTabsType
    }
  | {
      type: 'row' | 'col'
      children: DynamicLayoutType[]
    }
)

type PropsType = {
  vertical?: boolean
  collapse?: boolean
  layout: DynamicLayoutType
}

/** 灵动布局 */
const DynamicLayout: FC<PropsType> = memo(({ collapse, layout }) => {
  if ('tabs' in layout) {
    return <DynamicLayoutTabs tabs={layout.tabs} />
  }
  return (
    <div className="size-full">
      <DynamicLayoutSplitter
        mode={layout.type === 'col' ? 'vertical' : 'horizontal'}
        layout={layout.children}
        collapse={collapse}
      />
    </div>
  )
})

DynamicLayout.displayName = 'DynamicLayout'

export { DynamicLayout }

/** 动态布局 */
const DynamicLayoutRoot: FC<PropsType> = memo(({ layout }) => {
  useEffect(() => {
    console.log('first')
  }, [layout])

  if ('tabs' in layout) {
    return (
      <div className="p-2 size-full">
        <DynamicLayoutTabs tabs={layout.tabs} />
      </div>
    )
  }
  return (
    <div className="p-2 size-full">
      <DynamicLayoutSplitter
        mode={layout.type === 'col' ? 'vertical' : 'horizontal'}
        layout={layout.children}
      />
    </div>
  )
})

DynamicLayoutRoot.displayName = 'DynamicLayoutRoot'

export default DynamicLayoutRoot
