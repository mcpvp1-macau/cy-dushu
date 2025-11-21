import IconLightMode from '@/assets/icons/jsx/IconLightMode'
import IconDarkMode from '@/assets/icons/jsx/IconDarkMode'
import IconSystemMode from '@/assets/icons/jsx/IconSystemMode'
import IconPolice from '@/assets/icons/jsx/IconPolice'
import IconButton from '../ui/button/IconButton'
import useThemeStore, { type ThemeSetting } from '@/store/useTheme.store'
import { Dropdown } from 'antd'

const ThemeSwitcher: FC = () => {
  const themeMode = useThemeStore((s) => s.mode)
  const setThemeMode = useThemeStore((s) => s.setMode)

  const themeItems = useMemo(
    () => [
      { label: <IconSystemMode />, key: 'system' },
      { label: <IconLightMode />, key: 'light' },
      { label: <IconDarkMode />, key: 'dark' },
      { label: <IconPolice />, key: 'jh-police' },
    ],
    [],
  )

  const currentThemeIcon = useMemo(
    () =>
      ({
        system: <IconSystemMode />,
        light: <IconLightMode />,
        dark: <IconDarkMode />,
        ['jh-police']: <IconPolice />,
      }[themeMode]),
    [themeMode],
  )

  return (
    <Dropdown
      menu={{
        items: themeItems,
        onClick: ({ key }) => setThemeMode(key as ThemeSetting),
      }}
      trigger={['click']}
    >
      <IconButton>{currentThemeIcon}</IconButton>
    </Dropdown>
  )
}

ThemeSwitcher.displayName = 'ThemeSwitcher'

export default ThemeSwitcher
