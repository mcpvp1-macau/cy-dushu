import IconLeft from '@/assets/icons/jsx/IconLeft'
import IconRight from '@/assets/icons/jsx/IconRight'
import { ReactNode } from 'react'

type PropsType = {
  children?: ReactNode
}

/** 可折叠页面 */
const CollapsedPage: FC<PropsType> = memo(({ children }) => {
  const [open, setOpen] = useState(true)
  return (
    <div className="h-full overflow-y-hidden flex">
      <div
        className={clsx('h-full flex flex-col overflow-hidden', 'w-[350px]', {
          hidden: !open,
        })}
      >
        <div className=" bg-[#141d28] bg-opacity-90 backdrop-blur-sm flex-1 overflow-hidden">
          {children}
        </div>
        {/* 地图底部状态栏栏目占位 */}
        <div className="h-5" />
      </div>
      <button
        className="bg-[#141d28e6] h-12 border border-solid border-ground-4 rounded-r mt-12 text-fore hover:text-primary origin-top-left scale-90"
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
