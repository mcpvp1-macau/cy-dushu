import { getThemeConfig } from '@/config/theme-config'
import useThemeStore from '@/store/useTheme.store'
import { XProvider } from '@ant-design/x'
import { useEffect, useMemo } from 'react'
import AppEmpty from './AppEmpty'

type Props = {
  children: React.ReactNode
  locale: any
}

const AppThemeProvider: FC<Props> = ({ children, locale }) => {
  const mode = useThemeStore((s) => s.mode)
  const resolvedTheme = useThemeStore((s) => s.resolvedTheme)
  const initTheme = useThemeStore((s) => s.init)
  const applySystemPreference = useThemeStore((s) => s.applySystemPreference)

  const themeConfig = useMemo(
    () => getThemeConfig(resolvedTheme),
    [resolvedTheme],
  )

  useEffect(() => {
    initTheme()
  }, [initTheme])

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applySystemPreference()
    media.addEventListener('change', handler)
    return () => media.removeEventListener('change', handler)
  }, [applySystemPreference, mode])

  return (
    <XProvider
      renderEmpty={() => <AppEmpty />}
      theme={themeConfig}
      locale={locale}
    >
      {children}
    </XProvider>
  )
}

AppThemeProvider.displayName = 'AppThemeProvider'

export default AppThemeProvider
