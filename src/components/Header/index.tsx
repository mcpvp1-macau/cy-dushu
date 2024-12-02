import IconLoginUser from '@/assets/icons/jsx/IconLoginUser'
import useUserStore from '@/store/useUser.store'
import { CaretDownOutlined } from '@ant-design/icons'
import { Popover } from 'antd'
import UserDownMenu from './UserDownMenu'
import HeaderSetting from './HeaderSetting'
import POISearch from './POISearch'
import Fullscreen from './Fullscreen'

type PropsType = unknown

const Header: FC<PropsType> = memo(() => {
  const [poVisible, setPoVisible] = useState(false)

  const user = useUserStore((s) => s.user)

  return (
    <header className="h-[38px] bg-ground-100 flex items-center justify-between border-b border-solid border-ground-300">
      {/* 左边 */}
      <div className="pl-1 flex items-center gap-3">
        <div className="w-[30px] max-w-[30px] h-[30px] max-h-[30px] p-1.5 bg-ground-200 text-fore text-center flex items-center justify-center rounded">
          <img
            src={globalConfig.logo ?? '/logo.svg'}
            className="w-full h-full object-contain select-none"
          />
        </div>
        <div>
          <POISearch />
        </div>
      </div>
      <div id="app-header-center"></div>
      {/* 右边 */}
      <div className="text-fore mr-3 flex gap-3">
        <Fullscreen target={document.documentElement} />
        <HeaderSetting />
        <Popover
          className="hover:cursor-pointer"
          placement={'bottomRight'}
          content={<UserDownMenu />}
          trigger={'click'}
          open={poVisible}
          onOpenChange={() => setPoVisible(!poVisible)}
        >
          <div className="flex items-center gap-1 text-sm">
            <IconLoginUser className="text-lg" />
            <span>{user?.name}</span>
            <CaretDownOutlined />
          </div>
        </Popover>
      </div>
    </header>
  )
})

Header.displayName = 'AppHeader'

export default Header
