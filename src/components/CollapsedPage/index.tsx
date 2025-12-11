import IconLeft from '@/assets/icons/jsx/IconLeft'
import IconRight from '@/assets/icons/jsx/IconRight'
import useSituationLayoutStore from '@/store/layout/useSituationLayout.store'
import { ReactNode } from 'react'

type PropsType = {
  children?: ReactNode
}

/** 可折叠页面 */
const CollapsedPage: FC<PropsType> = memo(({ children }) => {
  // 为什么不直接使用  useSituationLayoutStore 的 collapsedOpen？
  // 因为 useSituationLayoutStore 的 collapsedOpen 是全局状态，
  // 需要再每次创建时都是默认打开的
  const [open, setOpen] = useState(true)
  useEffect(() => {
    useSituationLayoutStore.getState().updateCollapsedOpen(open)
  }, [open])

  return (
    <div
      className={clsx(
        'h-full overflow-y-hidden flex  transition-[transform,filter] duration-500 ease-in-out',
        {
          '-translate-x-[350px]': !open,
          'pointer-events-auto': open,
        },
      )}
    >
      <div
        className={clsx('h-full flex flex-col overflow-hidden w-[350px]', {
          ['blur-sm']: !open,
        })}
      >
        <div className=" bg-ground-1/90 backdrop-blur-sm flex-1 overflow-hidden">
          {children}
        </div>
        {/* 地图底部状态栏栏目占位 */}
        <div className="h-5" />
      </div>
      <button
        className={clsx(
          'bg-ground-1/90 h-11 border border-solid border-ground-4 rounded-r mt-12 text-fore hover:text-primary origin-left scale-90 transition-transform duration-500 ease-in-out pointer-events-auto',
          // {
          //   ['-translate-x-[350px]']: !open,
          // },
        )}
        onClick={() => setOpen(!open)}
      >
        {open ? (
          <IconLeft className="text-sm" />
        ) : (
          <IconRight className="text-sm" />
        )}
      </button>
    </div>
  )
})

CollapsedPage.displayName = 'CollapsedPage'

export default CollapsedPage
