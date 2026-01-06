import IconLoginUser from '@/assets/icons/jsx/IconLoginUser'
import useUserStore from '@/store/useUser.store'
import { CaretDownOutlined } from '@ant-design/icons'
import UserDownMenu from './UserDownMenu'
import HeaderSetting from './HeaderSetting'
import POISearch from './POISearch'
import Fullscreen from './Fullscreen'
import IconButton from '../ui/button/IconButton'
import IconLanguageEnglish from '@/assets/icons/jsx/IconLanguageEnglish'
import IconLanguageChinese from '@/assets/icons/jsx/IconLanguageChinese'
import IconThirdPartyPlatform from '@/assets/icons/jsx/IconThirdPartyPlatform'
import { Link } from 'react-router-dom'
import JALogo from '@/assets/svg_jsx/JALogo'
import ThemeSwitcher from './ThemeSwitcher'
import LiqunTippy from '../ui/LiqunTippy'
import { useFavicon } from 'ahooks'
import { getFavicon } from '@/global/favicon-change'

type PropsType = unknown

const Header: FC<PropsType> = memo(() => {
  const user = useUserStore((s) => s.user)
  const vendorBackUrl = useUserStore((s) => s.vendorBackUrl)
  const logo = useUserStore((s) => s.logo || globalConfig.logo)
  const logoLoading = useUserStore((s) => s.logoLoading)

  useFavicon(logo || globalConfig.logo || getFavicon())

  const { i18n } = useTranslation()
  return (
    <header className="h-[38px] bg-ground-1 flex items-center justify-between border-b border-solid border-ground-5 z-20 gap-3">
      {/* 左边 */}
      <div className="pl-1 flex items-center gap-3">
        <div className="w-[30px] max-w-[30px] h-[30px] max-h-[30px] bg-ground-3 text-fore text-center flex items-center justify-center rounded">
          {logo ? (
            <img
              src={logo}
              className="w-full h-full object-contain select-none"
            />
          ) : logoLoading ? (
            <></>
          ) : (
            <JALogo className="text-fore p-1.5" />
          )}
        </div>
        <POISearch />
      </div>
      <div id="app-header-center" className="flex-1 overflow-hidden"></div>
      {/* 右边 */}
      <div className="text-fore mr-3 flex gap-3">
        <ThemeSwitcher />
        <IconButton
          onClick={() => {
            i18n.changeLanguage(i18n.language === 'en' ? 'zh' : 'en')
            localStorage.setItem('lang', i18n.language)
          }}
        >
          {i18n.language === 'en' ? (
            <IconLanguageEnglish />
          ) : (
            <IconLanguageChinese />
          )}
        </IconButton>
        <Fullscreen target={document.documentElement} />
        {vendorBackUrl && (
          <Link to={vendorBackUrl}>
            <IconButton>
              <IconThirdPartyPlatform />
            </IconButton>
          </Link>
        )}
        <HeaderSetting />
        <LiqunTippy content={<UserDownMenu />} trigger={'click'}>
          <div className="flex items-center gap-1 text-sm cursor-pointer">
            <IconLoginUser className="text-lg" />
            <span>{user?.name}</span>
            <CaretDownOutlined />
          </div>
        </LiqunTippy>
      </div>
    </header>
  )
})

Header.displayName = 'AppHeader'

export default Header
