import { ScrollArea } from '@/components/ui/scroll-area'
import { Fragment, memo, type FC } from 'react'
import { DynamicLayoutType } from '..'
import useDynamicLayoutStore from '../store/useDynamicLayout.store'
import IconButton from '@/components/ui/button/IconButton'
import { IconFullscreenExit2 } from '@/assets/icons/jsx/IconFullscreenExit2'

type PropsType = {
  layout: DynamicLayoutType & {
    type: 'tabs'
  }
  onLayoutChange: (layout: DynamicLayoutType) => void
}

/** 灵动布局 - 全屏 tabs */
const DynamicLayoutFullTabs: FC<PropsType> = memo(
  ({ layout, onLayoutChange }) => {
    const iconMap = useDynamicLayoutStore((s) => s.iconMap)

    const handleExitFull = () => {
      onLayoutChange?.({ ...layout, isFull: false })
    }

    return (
      <div
        className={clsx(
          'flex justify-between items-center bg-ground-200 gap-2',
        )}
      >
        <ScrollArea className="flex-1 flex-shrink-0">
          <ul
            className={clsx(
              'flex gap-0.5 items-center text-sm p-1 select-none',
            )}
            onDoubleClick={handleExitFull}
          >
            {layout.children.map((e, i) => (
              <Fragment key={e.key}>
                {/* 分割线 */}
                {i > 0 && <li className={clsx('bg-ground-300 h-3 w-[1px]')} />}
                {/* Tab 标签 */}
                <li
                  className={clsx(
                    'px-1.5 py-0.5 cursor-pointer font-medium hover:bg-ground-250 rounded flex flex-shrink-0 gap-1 items-center text-white',
                    {
                      'text-opacity-70': e.key !== layout.activeKey,
                    },
                  )}
                  onClick={() => {
                    onLayoutChange?.({
                      ...layout,
                      activeKey: e.key,
                    })
                  }}
                >
                  <i
                    className={clsx({
                      'opacity-60': e.key !== layout.activeKey,
                    })}
                  >
                    {iconMap?.[e.key]}
                  </i>
                  <span>{e.title}</span>
                </li>
              </Fragment>
            ))}
          </ul>
        </ScrollArea>
        {/* 右侧小按钮 */}
        <div
          className={clsx(
            'text-sm flex gap-2 animate-in fade-in duration-500 items-center text-ground-300 pr-2',
          )}
        >
          <IconButton
            className="text-sm"
            toolTipProps={{
              title: '缩小',
              mouseEnterDelay: 0.2,
            }}
            onClick={handleExitFull}
          >
            <IconFullscreenExit2 />
          </IconButton>
        </div>
      </div>
    )
  },
)

DynamicLayoutFullTabs.displayName = 'DynamicLayoutFullTabs'

export default DynamicLayoutFullTabs
